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
      advertId: number,
      title: string,
      priceRub: number,
      url: string,
      age: number,
      imageUrl: string,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropAdvertCache(
      advertKey: string,
      scraperAdvertsKey: string,
      advertId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
