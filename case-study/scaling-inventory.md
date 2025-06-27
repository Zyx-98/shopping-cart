# Architectural Refactor: Scaling E-Commerce Inventory within a CQRS Saga

This document outlines a significant architectural improvement to the inventory management system of this e-commerce application. The goal was to solve performance bottlenecks within our CQRS/Saga workflow, especially under high user load. We achieved this by migrating the inventory-handling step from a **Pessimistic Locking** strategy (using distributed locks) to a more performant **Optimistic Locking** strategy.

## The Problem: The Bottleneck within the Order Saga

Our application uses the **Saga pattern** from the `@nestjs/cqrs` library to orchestrate the complex, multi-step process of placing an order. While this pattern provides excellent decoupling, we identified a major performance bottleneck: the inventory reservation step.

The initial approach used a distributed lock to ensure that no two sagas could modify the stock of the same product simultaneously. While safe, this **Pessimistic Locking** strategy created a bottleneck:

* **Blocking Operations:** A saga instance would have to wait to acquire a lock on a product. If a popular item was ordered frequently, multiple sagas would get stuck at the inventory step, waiting for the lock to be released.
* **Delayed Status Updates:** Because the saga was blocked, the final status of the order (`awaiting_payment` or `failed`) was slow to be updated in the database. This meant a client using **short polling** to check the order status would see a `pending` state for an unacceptably long time.
* **Limited Scalability:** The entire order fulfillment pipeline was only as fast as its slowest, locked step.

### The Old Flow

The original process was asynchronous, but the inventory handler was a blocking point within the saga, delaying the final outcome.

![old flow](/docs/scaling_inventory_old.excalidraw.png)

## The Solution: Asynchronous Commands with Optimistic Locking

The new architecture keeps the Saga pattern but refactors the inventory handler to be non-blocking and highly concurrent.

### 1. Asynchronous Sagas for Immediate Feedback

We continue to use the Saga pattern to provide an immediate API response to the user. This core part of the architecture remains unchanged, as it correctly decouples the initial request from the multi-step fulfillment process.

### 2. Optimistic Locking for High-Throughput Handlers

The critical change was replacing the distributed lock within the `ReserveInventoryForOrderHandler` with an **Optimistic Locking** strategy.

This is achieved by adding a `version` number column to our `inventories` table.

The update process executed by the handler now looks like this:
1.  The handler reads the product's current stock level **and its `version` number**.
2.  It attempts to update the stock, but with a crucial condition: the `WHERE` clause of the `UPDATE` query must match both the `inventory_id` **and the original `version` number** that was read.
3.  **If the update succeeds**, it means no other saga instance has modified the item in the meantime. We also atomically increment the `version` number as part of the same update.
4.  **If the update fails** (0 rows affected), it means another saga instance updated the record first. The handler now gracefully handles this conflict by throwing an exception, allowing the command to be retried (if configured) or the saga to proceed down a failure path.

### The New, Improved Flow

The new flow is fully non-blocking, allowing multiple sagas to process inventory reservations concurrently and providing rapid feedback for polling clients.

![new flow](/docs/scaling_inventory_new.excalidraw.png)

### Code Comparison

The change is isolated to the command handler responsible for inventory, leaving the rest of the saga logic intact.

**Before: Pessimistic Locking in the Handler**
```typescript
@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler
  implements ICommandHandler<ReserveInventoryForOrderCommand>
{
  //...
  async execute(command: ReserveInventoryForOrderCommand) {
    const lock = await this.distributedLockService.acquire(/* ... */);
    try {
      // ...
    } finally {
      await this.distributedLockService.release(lock);
    }
  }
}
```

**After: Optimistic Locking in the Handler (with TypeORM)**
```typescript
// The new, non-blocking approach using a version number
@CommandHandler(ReserveInventoryForOrderCommand)
export class ReserveInventoryForOrderHandler {
  async execute(command: ReserveInventoryForOrderCommand) {
    //... 
    inventory.removeQuantity(orderLine.quantity);
    versionMap.set(inventory.id, inventory.version);
    inventory.nextVersion();

    const updatedRows = await inventoryRepository.persistManyWithVersion(
      inventories,
      versionMap,
    );

    if (updatedRows !== inventories.length) {
      this.logger.warn(
        `Optimistic lock conflict for order ID: ${orderId.toValue()}. Will trigger retry.`,
      );
      throw new ConflictException(
        'Inventory conflict detected. Please retry.',
      );
    }
  }
}
```

## Results & Benefits

This targeted refactor yielded significant improvements to our existing CQRS/Saga architecture:

-   ✅ **Greatly Increased Throughput:** The system can now process a much higher volume of concurrent orders as the inventory handler is no longer a blocking bottleneck.
-   🚀 **Enhanced User Experience:** Polling clients now receive the final order status much more quickly because the saga is not stalled waiting for locks.
-   🔒 **Improved Resilience:** The system gracefully handles concurrency conflicts at the database level, which is more robust and scalable than managing distributed application-level locks.
-   📈 **Greater Scalability:** Our existing architecture is now free to scale more effectively, as the primary point of contention has been removed.