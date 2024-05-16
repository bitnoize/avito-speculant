import { Redis } from 'ioredis'
import {
  ReportCache,
  ReportTopic,
  CategoryReport,
  reportCacheKey,
  reportsIndexKey
} from './report-cache.js'
import { advertsIndexKey } from '../advert-cache/advert-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

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
  advertId: number
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
  categoryId: number,
  topic: ReportTopic
): Promise<number[]> {
  const result = await redis.fetchReportsIndex(
    reportsIndexKey(categoryId, topic) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchReportsIndex malformed result`)
}

export async function fetchReportsCache(
  redis: Redis,
  categoryId: number,
  reportIds: number[]
): Promise<ReportCache[]> {
  if (reportIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  reportIds.forEach((reportId) => {
    pipeline.fetchReportCache(
      reportCacheKey(categoryId, reportId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchReportsCache malformed result`)
}

export async function saveReportsCache(
  redis: Redis,
  scraperId: string,
  categoryId: number,
  tgFromId: string,
  token: string,
  categoryReports: CategoryReport[]
): Promise<void> {
  if (categoryReports.length === 0) {
    return
  }

  const multi = redis.multi()

  categoryReports.forEach((categoryReport) => {
    const [advertId, postedAt] = categoryReport

    multi.saveReportCache(
      reportCacheKey(categoryId, advertId), // KEYS[1]
      scraperId, // ARGV[1]
      categoryId, // ARGV[2]
      advertId, // ARGV[3]
      tgFromId, // ARGV[4]
      token, // ARGV[5]
      postedAt // ARGV[6]
    )
  })

  await multi.exec()
}

export async function saveSkipReportsIndex(
  redis: Redis,
  scraperId: string,
  categoryId: number
): Promise<void> {
  await redis.saveSkipReportsIndex(
    advertsIndexKey(scraperId), // KEYS[1]
    reportsIndexKey(categoryId, 'wait'), // KEYS[2]
    reportsIndexKey(categoryId, 'send'), // KEYS[3]
    reportsIndexKey(categoryId, 'done') // KEYS[4]
  )
}

export async function saveWaitReportsIndex(
  redis: Redis,
  scraperId: string,
  categoryId: number
): Promise<void> {
  await redis.saveWaitReportsIndex(
    advertsIndexKey(scraperId), // KEYS[1]
    reportsIndexKey(categoryId, 'wait'), // KEYS[2]
    reportsIndexKey(categoryId, 'send'), // KEYS[3]
    reportsIndexKey(categoryId, 'done') // KEYS[4]
  )
}

export async function saveSendReportsIndex(
  redis: Redis,
  categoryId: number,
  limit: number
): Promise<void> {
  await redis.saveSendReportsIndex(
    reportsIndexKey(categoryId, 'wait'), // KEYS[1]
    reportsIndexKey(categoryId, 'send'), // KEYS[2]
    limit // ARGV[1]
  )
}

export async function saveDoneReportCache(
  redis: Redis,
  categoryId: number,
  advertId: number,
  postedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.dropReportCache(
    reportCacheKey(categoryId, advertId) // KEYS[1]
  )

  multi.saveDoneReportsIndex(
    reportsIndexKey(categoryId, 'send'), // KEYS[1]
    reportsIndexKey(categoryId, 'done'), // KEYS[2]
    advertId, // ARGV[1]
    postedAt // ARGV[2]
  )

  await multi.exec()
}

/*
export async function dropReportCache(
  redis: Redis,
  categoryId: number,
  advertId: number
): Promise<void> {
  const multi = redis.multi()

  multi.dropReportCache(
    reportCacheKey(categoryId, advertId) // KEYS[1]
  )

  multi.dropReportsIndex(
    reportsIndexKey(categoryId, 'wait'), // KEYS[1]
    reportsIndexKey(categoryId, 'send'), // KEYS[2]
    reportsIndexKey(categoryId, 'done'), // KEYS[3]
    advertId // ARGV[1]
  )

  await multi.exec()
}
*/

const parseModel = (result: unknown, message: string): ReportCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 7, message)

  return {
    scraperId: parseString(hash[0], message),
    categoryId: parseNumber(hash[1], message),
    advertId: parseNumber(hash[2], message),
    tgFromId: parseString(hash[3], message),
    token: parseString(hash[4], message),
    postedAt: parseNumber(hash[5], message),
    attempt: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): ReportCache[] => {
  const collection: ReportCache[] = []

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
