import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchScraperCache(scraperKey: string, callback?: Callback<string>): Result<string, Context>

    fetchScrapers(scrapersKey: string, callback?: Callback<string>): Result<string, Context>

    findAvitoUrlScrapers(
      avitoUrlScrapersKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveScraperCache(
      scraperKey: string,
      scrapersKey: string,
      avitoUrlScrapersKey: string,
      scraperId: string,
      avitoUrl: string,
      intervalSec: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperCache(
      scraperKey: string,
      scrapersKey: string,
      avitoUrlScrapersKey: string,
      scraperId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    renewSuccessScraperCache(
      scraperKey: string,
      proxyKey: string,
      sizeBytes: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewFailedScraperCache(
      scraperKey: string,
      proxyKey: string,
      sizeBytes: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
