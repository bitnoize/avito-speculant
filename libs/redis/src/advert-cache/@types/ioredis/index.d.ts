import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchAdvertCache(advertKey: string, callback?: Callback<string>): Result<string, Context>

    fetchScraperAdverts(
      scraperAdvertsKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchCategoryAdverts(
      categoryAdvertsKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveAdvertCache(
      advertKey: string,
      scraperAdvertsKey: string,
      categoryAdvertsKey: string,
      advertId: number,
      title: string,
      priceRub: number,
      url: string,
      age: number,
      imageUrl: string,
      topic: string,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropAdvertCache(
      advertKey: string,
      scraperAdvertsKey: string,
      categoryAdvertsKey: string,
      advertId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
