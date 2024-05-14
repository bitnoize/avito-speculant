import { RedisMethod } from '../../redis.js'

export type SaveSkipReportsIndexRequest = {
  scraperId: string
  categoryId: number
}

export type SaveSkipReportsIndexResponse = void

export type SaveSkipReportsIndex = RedisMethod<
  SaveSkipReportsIndexRequest,
  SaveSkipReportsIndexResponse
>
