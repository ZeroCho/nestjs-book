import { HttpException, HttpExceptionOptions } from "@nestjs/common";

export class TooManyRequestsException extends HttpException {
  constructor(message?: string, options?: HttpExceptionOptions) {
    super(message || 'Too many requests', 429, options);
  }
}
