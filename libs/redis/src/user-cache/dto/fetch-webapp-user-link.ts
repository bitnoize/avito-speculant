import { RedisMethod } from '../../redis.js'

export type FetchWebappUserLinkRequest = {
  session: string
}

export type FetchWebappUserLinkResponse = {
  userId?: number
}

export type FetchWebappUserLink = RedisMethod<
  FetchWebappUserLinkRequest,
  FetchWebappUserLinkResponse
>
