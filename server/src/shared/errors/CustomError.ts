export class CustomError {
  public readonly message: string
  public readonly code: number

  constructor(message: string, code: number = 400) {
    this.message = message
    this.code = code
  }
}
