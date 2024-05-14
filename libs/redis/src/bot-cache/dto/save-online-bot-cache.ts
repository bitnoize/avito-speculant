import { RedisMethod } from '../../redis.js'

export type SaveOnlineBotCacheRequest = {
  botId: number
}

export type SaveOnlineBotCacheResponse = void

export type SaveOnlineBotCache = RedisMethod<SaveOnlineBotCacheRequest, SaveOnlineBotCacheResponse>
