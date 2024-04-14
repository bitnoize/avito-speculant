import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchAdvertCache(advertKey: string, callback?: Callback<string>): Result<string, Context>

    fetchAdverts(advertsKey: string, callback?: Callback<string>): Result<string, Context>

    saveAdvertCache(
      advertKey: string,
      scraperAdvertsKey: string,
      advertId: number,
      title: string,
      description: string,
      priceRub: number,
      url: string,
      age: string,
      imageUrl: string,
      postedAt: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropAdvertCache(
      advertKey: string,
      scraperAdvertsKey: string,
      advertId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    pourCategoryAdvertsSkip(
      scraperAdvertsKey: string,
      categoryAdvertsWaitKey: string,
      categoryAdvertsSendKey: string,
      categoryAdvertsDoneKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    pourCategoryAdvertsWait(
      scraperAdvertsKey: string,
      categoryAdvertsWaitKey: string,
      categoryAdvertsSendKey: string,
      categoryAdvertsDoneKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    pourCategoryAdvertsSend(
      categoryAdvertsWaitKey: string,
      categoryAdvertsSendKey: string,
      count: number,
      callback?: Callback<string>
    ): Result<string, Context>

    pourCategoryAdvertDone(
      categoryAdvertsSendKey: string,
      categoryAdvertsDoneKey: string,
      advertId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
