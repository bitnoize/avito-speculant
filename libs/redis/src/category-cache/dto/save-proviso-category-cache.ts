import { RedisMethod } from '../../redis.js'

export type SaveProvisoCategoryCacheRequest = {
  categoryId: number
  reportedAt: number
}

export type SaveProvisoCategoryCache = RedisMethod<SaveProvisoCategoryCacheRequest, void>
