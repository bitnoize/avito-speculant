import { RedisMethod } from '../../redis.js'

export type FetchWebappUserLinkRequest = {
  token: string
}

export type FetchWebappUserLinkResponse = number | undefined

export type FetchWebappUserLink = RedisMethod<
  FetchWebappUserLinkRequest,
  FetchWebappUserLinkResponse
>
