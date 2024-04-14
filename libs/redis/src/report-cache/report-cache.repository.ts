import { Redis } from 'ioredis'
import {
  ReportCache,
  AvitoReport,
  reportKey,
  reportsKey
} from './report-cache.js'
import {
  parseNumber,
  parseString,
  parseManyStrings,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'
import { categoryAdvertsKey } from '../advert-cache/advert-cache.js'

export async function fetchReportCache(redis: Redis, reportId: string): Promise<ReportCache> {
  const result = await redis.fetchReportCache(
    reportKey(reportId) // KEYS[1]
  )

  return parseModel(result, `ReportCache fetchReportCache malformed result`)
}

export async function stampReportCache(
  redis: Redis,
  reportId: string
): Promise<ReportCache | undefined> {
  const result = await redis.stampReportCache(
    reportKey(reportId), // KEYS[1]
    reportsKey(), // KEYS[2]
    reportId // ARGV[2]
  )

  if (result == null) {
    return undefined
  }

  return parseModel(result, `ReportCache stampReportCache malformed result`)
}

export async function fetchReports(redis: Redis, limit: number): Promise<string[]> {
  const result = await redis.fetchReports(
    reportsKey(), // KEYS[1]
    limit // ARGV[1]
  )

  return parseManyStrings(result, `ReportCache fetchReports malformed result`)
}

export async function fetchReportsCache(redis: Redis, reportIds: string[]): Promise<ReportCache[]> {
  if (reportIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  reportIds.forEach((reportId) => {
    pipeline.fetchReportCache(
      reportKey(reportId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `ReportCache fetchReportsCache malformed result`)
}

export async function saveReportsCache(
  redis: Redis,
  avitoReports: AvitoReport[]
): Promise<void> {
  if (avitoReports.length === 0) {
    return
  }

  const pipeline = redis.pipeline()

  avitoReports.forEach((avitoReport) => {
    const reportId = avitoReport.slice(0, 2).join('-')
    pipeline.saveReportCache(
      reportKey(reportId), // KEYS[1]
      reportsKey(), // KEYS[2]
      reportId, // ARGV[1]
      ...avitoReport, // ARGV[2..5]
      Date.now() // ARGV[6]
    )
  })

  await pipeline.exec()
}

export async function dropReportCache(
  redis: Redis,
  reportId: string,
  categoryId: number,
  advertId: number,
  postedAt: number
): Promise<void> {
  await redis.dropReportCache(
    reportKey(reportId), // KEYS[1]
    reportsKey(), // KEYS[2]
    categoryAdvertsKey(categoryId, 'send'), // KEYS[3]
    categoryAdvertsKey(categoryId, 'done'), // KEYS[4]
    reportId, // ARGV[1]
    advertId, // ARGV[2]
    postedAt // ARGV[3]
  )
}

const parseModel = (result: unknown, message: string): ReportCache => {
  const hash = parseHash(result, 7, message)

  return {
    id: parseString(hash[0], message),
    categoryId: parseNumber(hash[1], message),
    advertId: parseNumber(hash[2], message),
    tgFromId: parseString(hash[3], message),
    postedAt: parseNumber(hash[4], message),
    attempt: parseNumber(hash[5], message),
    time: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): ReportCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
