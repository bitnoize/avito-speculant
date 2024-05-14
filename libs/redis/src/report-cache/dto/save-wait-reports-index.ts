import { RedisMethod } from '../../redis.js'

export type SaveWaitReportsIndexRequest = {
  scraperId: string
  categoryId: number
}

export type SaveWaitReportsIndexResponse = void

export type SaveWaitReportsIndex = RedisMethod<
  SaveWaitReportsIndexRequest,
  SaveWaitReportsIndexResponse
>
