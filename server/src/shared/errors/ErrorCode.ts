/**
 * Error codes for HTTP status.
 * @see {@link https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml}
 */
export enum ErrorCode {
  // Client error responses
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  RequestTimeout = 408,
  Conflict = 409,
  TooManyRequests = 429,

  // Server error responses
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}
