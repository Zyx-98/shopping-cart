import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSagaInstancesTable1749270018489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saga_instances',
        columns: [
          {
            name: 'uuid',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'saga_type',
            type: 'varchar',
          },
          {
            name: 'correlation_id',
            type: 'varchar',
          },
          {
            name: 'current_step',
            type: 'varchar',
          },
          {
            name: 'payload',
            type: 'jsonb',
          },
          {
            name: 'is_compensating',
            type: 'boolean',
            default: false,
          },
          {
            name: 'retries',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'saga_instances',
      new TableIndex({
        name: 'idx_saga_correlation_id',
        columnNames: ['correlation_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('saga_instances', 'idx_saga_correlation_id');
    await queryRunner.dropTable('saga_instances');
  }
}
