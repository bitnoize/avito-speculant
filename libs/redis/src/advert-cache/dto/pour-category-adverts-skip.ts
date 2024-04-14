import { RedisMethod } from '../../redis.js'

export type PourCategoryAdvertsSkipRequest = {
  scraperId: string
  categoryId: number
}

export type PourCategoryAdvertsSkipResponse = void

export type PourCategoryAdvertsSkip = RedisMethod<
  PourCategoryAdvertsSkipRequest,
  PourCategoryAdvertsSkipResponse
>
