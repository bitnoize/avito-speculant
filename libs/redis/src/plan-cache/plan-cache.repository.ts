import { Redis } from 'ioredis'
import { PlanCache, planCacheKey, plansIndexKey } from './plan-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchPlanCache(redis: Redis, planId: number): Promise<PlanCache | undefined> {
  const result = await redis.fetchPlanCache(
    planCacheKey(planId) // KEYS[1]
  )

  return parseModel(result, `fetchPlanCache malformed result`)
}

export async function fetchPlansIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchPlansIndex(
    plansIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchPlansIndex malformed result`)
}

export async function fetchPlansCache(redis: Redis, planIds: number[]): Promise<PlanCache[]> {
  if (planIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  planIds.forEach((planId) => {
    pipeline.fetchPlanCache(
      planCacheKey(planId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchPlansCache malformed result`)
}

export async function savePlanCache(
  redis: Redis,
  planId: number,
  categoriesMax: number,
  durationDays: number,
  intervalSec: number,
  analyticsOn: boolean,
  priceRub: number,
  isEnabled: boolean,
  subscriptions: number,
  createdAt: number,
  updatedAt: number,
  queuedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.savePlanCache(
    planCacheKey(planId), // KEYS[1]
    planId, // ARGV[1]
    categoriesMax, // ARGV[2]
    durationDays, // ARGV[3]
    intervalSec, // ARGV[4]
    analyticsOn ? 1 : 0, // ARGV[5]
    priceRub, // ARGV[6]
    isEnabled ? 1 : 0, // ARGV[7]
    subscriptions, // ARGV[8]
    createdAt, // ARGV[9]
    updatedAt, // ARGV[10]
    queuedAt // ARGV[11]
  )

  multi.savePlansIndex(
    plansIndexKey(), // KEYS[1]
    planId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function dropPlanCache(redis: Redis, planId: number): Promise<void> {
  const multi = redis.multi()

  multi.dropPlanCache(
    planCacheKey(planId) // KEYS[1]
  )

  multi.dropPlansIndex(
    plansIndexKey(), // KEYS[1]
    planId // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): PlanCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 11, message)

  return {
    id: parseNumber(hash[0], message),
    categoriesMax: parseNumber(hash[1], message),
    durationDays: parseNumber(hash[2], message),
    intervalSec: parseNumber(hash[3], message),
    analyticsOn: !!parseNumber(hash[4], message),
    priceRub: parseNumber(hash[5], message),
    isEnabled: !!parseNumber(hash[6], message),
    subscriptions: parseNumber(hash[7], message),
    createdAt: parseNumber(hash[8], message),
    updatedAt: parseNumber(hash[9], message),
    queuedAt: parseNumber(hash[10], message)
  }
}

const parseCollection = (result: unknown, message: string): PlanCache[] => {
  const collection: PlanCache[] = []

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
