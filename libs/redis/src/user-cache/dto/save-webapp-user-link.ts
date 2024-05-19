import { RedisMethod } from '../../redis.js'

export type SaveWebappUserLinkRequest = {
  token: string
  userId: number
}

export type SaveWebappUserLink = RedisMethod<SaveWebappUserLinkRequest, void>
