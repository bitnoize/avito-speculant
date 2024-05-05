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
): Promise<void> {
  await redis.savePlanCache(
    planKey(planId), // KEYS[1]
    plansKey(), // KEYS[2]
    planId, // ARGV[1]
    categoriesMax, // ARGV[2]
    durationDays, // ARGV[4]
    intervalSec, // ARGV[5]
    analyticsOn ? 1 : 0, // ARGV[6]
    priceRub, // ARGV[3]
    Date.now() // ARGV[7]
  )
}

const parseModel = (result: unknown, message: string): PlanCache => {
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
  const pipeline = parsePipeline(result, message)

  return pipeline
    .map((pl) => {
      const command = parseCommand(pl, message)
      return parseModel(command, message)
    })
    .filter((model) => model !== undefined)
}
