import { RedisMethod } from '../../redis.js'

export type SaveSendReportsIndexRequest = {
  categoryId: number
  limit: number
}

export type SaveSendReportsIndexResponse = void

export type SaveSendReportsIndex = RedisMethod<
  SaveSendReportsIndexRequest,
  SaveSendReportsIndexResponse
>
