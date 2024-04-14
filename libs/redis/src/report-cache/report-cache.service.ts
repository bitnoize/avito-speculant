import {
  FetchReportCache,
  StampReportCache,
  FetchReportsCache,
  SaveReportsCache,
  DropReportCache
} from './dto/index.js'
import * as reportCacheRepository from './report-cache.repository.js'

/*
 * Fetch ReportCache
 */
export const fetchReportCache: FetchReportCache = async function (redis, request) {
  const reportCache = await reportCacheRepository.fetchReportCache(redis, request.reportId)

  return { reportCache }
}

/*
 * Stamp ReportCache
 */
export const stampReportCache: StampReportCache = async function (redis, request) {
  const reportCache = await reportCacheRepository.stampReportCache(redis, request.reportId)

  return { reportCache }
}

/*
 * Fetch ReportsCache
 */
export const fetchReportsCache: FetchReportsCache = async function (redis, request) {
  const reportIds = await reportCacheRepository.fetchReports(redis, request.limit)
  const reportsCache = await reportCacheRepository.fetchReportsCache(redis, reportIds)

  return { reportsCache }
}

/*
 * Save ReportsCache
 */
export const saveReportsCache: SaveReportsCache = async function (redis, request) {
  await reportCacheRepository.saveReportsCache(redis, request.avitoReports)
}

/*
 * Drop ReportCache
 */
export const dropReportCache: DropReportCache = async function (redis, request) {
  await reportCacheRepository.dropReportCache(
    redis,
    request.reportId,
    request.categoryId,
    request.advertId,
    request.postedAt
  )
}
