import { Request, Response, NextFunction } from 'express'
import { GetUserQuerySchema } from '../validations/user.validation'
import { AuthTokenSchema } from '../validations/auth.validation'
import { CreateSessionSchema } from '../validations/session.validation'

export interface Dictionary<T> {
  [key: string]: T
}

interface RequestParams {}

interface ResponseBody {}

type RequestQuery = GetUserQuerySchema

type RequestBody = AuthTokenSchema & CreateSessionSchema

interface ResponseBody {}

export interface CustomRequest<P = RequestParams, ResBody = ResponseBody, ReqBody = RequestBody, Q = RequestQuery>
  extends Request<P, ResBody, ReqBody, Q> {}

export interface CustomResponse<ResBody = ResponseBody> extends Response<ResBody> {}

export interface CustomNextFunction extends NextFunction {}
