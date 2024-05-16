import {
  FetchReportCache,
  StampReportCache,
  FetchReportsCache,
  SaveReportsCache,
  SaveSkipReportsIndex,
  SaveWaitReportsIndex,
  SaveSendReportsIndex,
  SaveDoneReportsIndex,
  DropReportCache
} from './dto/index.js'
import { ReportCacheNotFoundError } from './report-cache.errors.js'
import * as reportCacheRepository from './report-cache.repository.js'

/*
 * Fetch ReportCache
 */
export const fetchReportCache: FetchReportCache = async function (redis, request) {
  const reportCache = await reportCacheRepository.fetchReportCache(
    redis,
    request.categoryId,
    request.advertId
  )

  if (reportCache === undefined) {
    throw new ReportCacheNotFoundError({ request })
  }

  return { reportCache }
}

/*
 * Stamp ReportCache
 */
export const stampReportCache: StampReportCache = async function (redis, request) {
  const reportCache = await reportCacheRepository.stampReportCache(
    redis,
    request.categoryId,
    request.advertId
  )

  return { reportCache }
}

/*
 * Fetch ReportsCache
 */
export const fetchReportsCache: FetchReportsCache = async function (redis, request) {
  const reportIds = await reportCacheRepository.fetchReportsIndex(
    redis,
    request.categoryId,
    request.topic
  )
  const reportsCache = await reportCacheRepository.fetchReportsCache(
    redis,
    request.categoryId,
    reportIds
  )

  return { reportsCache }
}

/*
 * Save ReportsCache
 */
export const saveReportsCache: SaveReportsCache = async function (redis, request) {
  await reportCacheRepository.saveReportsCache(
    redis,
    request.scraperId,
    request.categoryId,
    request.tgFromId,
    request.token,
    request.categoryReports
  )
}

/*
 * Save SkipReportsIndex
 */
export const saveSkipReportsIndex: SaveSkipReportsIndex = async function (redis, request) {
  await reportCacheRepository.saveSkipReportsIndex(redis, request.scraperId, request.categoryId)
}

/*
 * Save WaitReportsIndex
 */
export const saveWaitReportsIndex: SaveWaitReportsIndex = async function (redis, request) {
  await reportCacheRepository.saveWaitReportsIndex(redis, request.scraperId, request.categoryId)
}

/*
 * Save SendReportsIndex
 */
export const saveSendReportsIndex: SaveSendReportsIndex = async function (redis, request) {
  await reportCacheRepository.saveSendReportsIndex(redis, request.categoryId, request.limit)
}

/*
 * Save DoneReportsIndex
 */
export const saveDoneReportsIndex: SaveDoneReportsIndex = async function (redis, request) {
  await reportCacheRepository.saveDoneReportsIndex(redis, request.categoryId, request.advertId)
}

/*
 * Drop ReportCache
 */
export const dropReportCache: DropReportCache = async function (redis, request) {
  await reportCacheRepository.dropReportCache(redis, request.categoryId, request.advertId)
}
