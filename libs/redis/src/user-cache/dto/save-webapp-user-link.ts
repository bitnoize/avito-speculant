import { RedisMethod } from '../../redis.js'

export type SaveWebappUserLinkRequest = {
  token: string
  userId: number
}

export type SaveWebappUserLinkResponse = void

export type SaveWebappUserLink = RedisMethod<
  SaveWebappUserLinkRequest,
  SaveWebappUserLinkResponse
>
