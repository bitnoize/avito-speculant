import { RedisMethod } from '../../redis.js'

export type SaveSkipReportsIndexRequest = {
  scraperId: string
  categoryId: number
}

export type SaveSkipReportsIndex = RedisMethod<SaveSkipReportsIndexRequest, void>
