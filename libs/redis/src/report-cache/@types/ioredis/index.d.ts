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
      reportCacheKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      categoryId: number, // ARGV[2]
      advertId: number, // ARGV[3]
      tgFromId: string, // ARGV[4]
      token: string, // ARGV[5]
      postedAt: number, // ARGV[6]
      callback?: Callback<string>
    ): Result<string, Context>

    saveSkipReportsIndex(
      advertsIndexKey: string, // KEYS[1]
      waitReportsIndexKey: string, // KEYS[2]
      sendReportsIndexKey: string, // KEYS[3]
      doneReportsIndexKey: string, // KEYS[4]
      callback?: Callback<string>
    ): Result<string, Context>

    saveWaitReportsIndex(
      advertsIndexKey: string, // KEYS[1]
      waitReportsIndexKey: string, // KEYS[2]
      sendReportsIndexKey: string, // KEYS[3]
      doneReportsIndexKey: string, // KEYS[4]
      callback?: Callback<string>
    ): Result<string, Context>

    saveSendReportsIndex(
      waitReportsIndexKey: string, // KEYS[1]
      sendReportsIndexKey: string, // KEYS[2]
      limit: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveDoneReportsIndex(
      sendReportsIndexKey: string, // KEYS[1]
      doneReportsIndexKey: string, // KEYS[2]
      advertId: number, // ARGV[1]
      postedAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropReportCache(
      reportCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    //  dropReportsIndex(
    //    reportsIndexKey: string, // KEYS[1]
    //    advertId: number, // ARGV[1]
    //    callback?: Callback<string>
    //  ): Result<string, Context>
  }
}
