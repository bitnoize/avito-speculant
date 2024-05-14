import { RedisMethod } from '../../redis.js'

export type SaveProvisoCategoryCacheRequest = {
  categoryId: number
  reportedAt: number
}

export type SaveProvisoCategoryCacheResponse = void

export type SaveProvisoCategoryCache = RedisMethod<
  SaveProvisoCategoryCacheRequest,
  SaveProvisoCategoryCacheResponse
>
