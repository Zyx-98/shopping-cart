import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from 'src/presentation/rest/auth/shared/request/request-with-user.request';

export class IsCustomerGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }

    if (user.customerId && user.customerId !== null) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. This action is available to customer only.',
    );
  }
}
