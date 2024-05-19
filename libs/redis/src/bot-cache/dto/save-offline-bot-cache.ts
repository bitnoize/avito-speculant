import { RedisMethod } from '../../redis.js'

export type SaveOfflineBotCacheRequest = {
  botId: number
}

export type SaveOfflineBotCache = RedisMethod<SaveOfflineBotCacheRequest, void>
