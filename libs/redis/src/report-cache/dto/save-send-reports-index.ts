import { RedisMethod } from '../../redis.js'

export type SaveSendReportsIndexRequest = {
  categoryId: number
  limit: number
}

export type SaveSendReportsIndex = RedisMethod<SaveSendReportsIndexRequest, void>
