import { ErrorCode } from './ErrorCode'

export class CustomError {
  public readonly message: string
  public readonly code: ErrorCode

  constructor(message: string, code: ErrorCode = ErrorCode.BadRequest) {
    this.message = message
    this.code = code
  }
}
