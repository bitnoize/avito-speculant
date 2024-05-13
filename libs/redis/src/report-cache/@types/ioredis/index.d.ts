import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchReportCache(
      reportCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    stampReportCache(
      reportCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchReportsIndex(
      reportsIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveReportCache(
      reportCacheKey: string,
      categoryId: number,
      advertId: number,
      tgFromId: string,
      postedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveReportsIndex(
      reportsIndexKey: string,
      advertId: number,
      postedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropReportCache(
      reportKey: string,
      reportsKey: string,
      categoryAdvertsDoneKey: string,
      categoryAdvertsSendKey: string,
      reportId: string,
      advertId: number,
      postedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
