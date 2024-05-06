import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchScraperCache(
      scraperCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUrlPathScraperId(
      urlPathScraperIdKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScrapersIndex(
      scrapersIndexKey: string,
      callback?: Callback<string>
    ): Result<string, Context>
    
    saveScraperCache(
      scraperCacheKey: string,
      scraperId: string,
      urlPath: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveUrlPathScraperId(
      urlPathScraperIdKey: string,
      scraperId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveScrapersIndex(
      scrapersIndexKey: string,
      scraperId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    dropScrapersIndex(
      scrapersIndexKey: string,
      scraperId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveSuccessScraperCache(
      scraperCacheKey: string,
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveFailedScraperCache(
      scraperCacheKey: string,
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperCache(
      scraperCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
