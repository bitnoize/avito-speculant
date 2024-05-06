import { RedisMethod } from '../../redis.js'

export type FetchWebappUserIdRequest = {
  token: string
}

export type FetchWebappUserIdResponse = number

export type FetchWebappUserId = RedisMethod<
  FetchWebappUserIdRequest,
  FetchWebappUserIdResponse
>
