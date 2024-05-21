import { RedisMethod } from '../../redis.js'

export type SaveWebappUserLinkRequest = {
  session: string
  userId: number
}

export type SaveWebappUserLink = RedisMethod<SaveWebappUserLinkRequest, void>
