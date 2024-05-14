import { RedisMethod } from '../../redis.js'

export type SaveDoneReportsIndexRequest = {
  categoryId: number
  advertId: number
}

export type SaveDoneReportsIndexResponse = void

export type SaveDoneReportsIndex = RedisMethod<
  SaveDoneReportsIndexRequest,
  SaveDoneReportsIndexResponse
>
