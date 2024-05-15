import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchScraperCache(
      scraperCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScraperLink(
      scraperLinkKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScrapersIndex(
      scrapersIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveScraperCache(
      scraperCacheKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      urlPath: string, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    saveSuccessScraperCache(
      scraperCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveFailedScraperCache(
      scraperCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveScraperLink(
      scraperLinkKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveScrapersIndex(
      scrapersIndexKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperCache(
      scraperCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperLink(
      scraperLinkKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropScrapersIndex(
      scrapersIndexKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
