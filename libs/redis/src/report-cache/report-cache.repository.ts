import { Redis } from 'ioredis'
import {
  ReportCache,
  AvitoReport,
  reportCacheKey,
  reportsIndexKey
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

export async function fetchReportCache(
  redis: Redis,
  categoryId: number,
  advertId: number
): Promise<ReportCache | undefined> {
  const result = await redis.fetchReportCache(
    reportCacheKey(categoryId, advertId) // KEYS[1]
  )

  return parseModel(result, `fetchReportCache malformed result`)
}

export async function stampReportCache(
  redis: Redis,
  categoryId: number,
  advertId: number,
): Promise<ReportCache | undefined> {
  const result = await redis.stampReportCache(
    reportCacheKey(categoryId, advertId) // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseModel(result, `stampReportCache malformed result`)
}

export async function fetchReportsIndex(
  redis: Redis,
  categoryId: number
): Promise<string[]> {
  const result = await redis.fetchReportsIndex(
    reportsIndexKey(categoryId) // KEYS[1]
  )

  return parseManyStrings(result, `fetchReportsIndex malformed result`)
}

export async function fetchReportsCache(redis: Redis, reportIds: string[]): Promise<ReportCache[]> {
  if (reportIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  reportIds.forEach((reportId) => {
    pipeline.fetchReportCache(
      reportCacheKey(reportId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchReportsCache malformed result`)
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
    const [categoryId, advertId, tgFromId, postedAt] = ...avitoReport

    pipeline.saveReportCache(
      reportCacheKey(categoryId, advertId), // KEYS[1]
      categoryId, // ARGV[1]
      advertId, // ARGV[2]
      tgFromId, // ARGV[3]
      postedAt, // ARGV[4]
    )

    pipeline.saveReportsIndex(
      reportsIndexKey(categoryId), // KEYS[1]
      advertId // ARGV[1]
    )
  })

  await pipeline.exec()
}

export async function dropReportCache(
  redis: Redis,
  categoryId: number,
  advertId: number,
  postedAt: number
): Promise<void> {
  const pipeline = redis.pipeline()

  pipeline.dropReportCache(
    reportKey(reportId), // KEYS[1]
    reportId, // ARGV[1]
    advertId, // ARGV[2]
    postedAt // ARGV[3]
  )

  pipeline.dropReportIndex(
    reportsIndexKey(categoryId), // KEYS[1]
    advertId // ARGV[1]
  )

  pipeline.dropAdvertIndex(
    categoryAdvertsIndexKey(categoryId, 'send'), // KEYS[1]
    advertId // ARGV[1]
  )

  pipeline.saveAdvertIndex(
    categoryAdvertsIndexKey(categoryId, 'done'), // KEYS[1]
    advertId // ARGV[1]
  )

  await pipeline.exec()
}

const parseModel = (result: unknown, message: string): ReportCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 5, message)

  return {
    categoryId: parseNumber(hash[0], message),
    advertId: parseNumber(hash[1], message),
    tgFromId: parseString(hash[2], message),
    postedAt: parseNumber(hash[3], message),
    attempt: parseNumber(hash[4], message)
  }
}

const parseCollection = (result: unknown, message: string): ReportCache[] => {
  const collection: ScraperCache[] = []

  const pipeline = parsePipeline(result, message)

  pipeline.forEach((pl) => {
    const command = parseCommand(pl, message)
    const model = parseModel(command, message)

    if (model !== undefined) {
      collection.push(model)
    }
  })

  return collection
}
