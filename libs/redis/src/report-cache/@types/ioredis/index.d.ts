import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchReportCache(reportKey: string, callback?: Callback<string>): Result<string, Context>

    stampReportCache(
      reportKey: string,
      reportsKey: string,
      reportId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchReports(
      reportsKey: string,
      limit: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveReportCache(
      reportKey: string,
      reportsKey: string,
      reportId: string,
      categoryId: number,
      advertId: number,
      tgFromId: string,
      postedAt: number,
      time: number,
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
