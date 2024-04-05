import { RedisMethod } from '../../redis.js'

export type PourCategoryAdvertDoneRequest = {
  categoryId: number
  advertId: number
}

export type PourCategoryAdvertDoneResponse = void

export type PourCategoryAdvertDone = RedisMethod<
  PourCategoryAdvertDoneRequest,
  PourCategoryAdvertDoneResponse
>
