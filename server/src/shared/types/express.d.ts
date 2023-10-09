declare namespace Express {
  export interface Request {
    /**
     * Custom context property to handle user's authentication as in-memory data.
     */
    ctx: {
      user: any
    }
  }
}
