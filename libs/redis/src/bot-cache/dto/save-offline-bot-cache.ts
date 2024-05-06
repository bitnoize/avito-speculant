import { RedisMethod } from '../../redis.js'

export type SaveOfflineBotCacheRequest = {
  botId: number
}

export type SaveOfflineBotCacheResponse = void

export type SaveOfflineBotCache = RedisMethod<
  SaveOfflineBotCacheRequest,
  SaveOfflineBotCacheResponse
>
