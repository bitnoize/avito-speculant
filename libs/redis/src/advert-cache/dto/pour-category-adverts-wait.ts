import { RedisMethod } from '../../redis.js'

export type PourCategoryAdvertsWaitRequest = {
  scraperId: string
  categoryId: number
}

export type PourCategoryAdvertsWaitResponse = void

export type PourCategoryAdvertsWait = RedisMethod<
  PourCategoryAdvertsWaitRequest,
  PourCategoryAdvertsWaitResponse
>
