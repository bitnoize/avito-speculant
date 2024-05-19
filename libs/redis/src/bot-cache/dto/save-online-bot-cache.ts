import { RedisMethod } from '../../redis.js'

export type SaveOnlineBotCacheRequest = {
  botId: number
  tgFromId: string
  username: string
}

export type SaveOnlineBotCache = RedisMethod<SaveOnlineBotCacheRequest, void>
