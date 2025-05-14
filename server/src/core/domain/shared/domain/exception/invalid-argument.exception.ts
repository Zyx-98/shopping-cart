import { BadRequestException } from '@nestjs/common';

export class InvalidArgumentException extends BadRequestException {
  constructor(message: string, property?: string) {
    super(
      `Invalid Argument: ${message}${property ? ` for property [${property}]` : ''}`,
    );
    this.name = 'InvalidArgumentException';
  }
}
