import { Redis } from 'ioredis'
import { PlanCache, planKey, plansKey } from './plan-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchPlanCache(redis: Redis, planId: number): Promise<PlanCache> {
  const result = await redis.fetchPlanCache(
    planKey(planId) // KEYS[1]
  )

  return parseModel(result, `PlanCache fetchPlanCache malformed result`)
}

export async function fetchPlans(redis: Redis): Promise<number[]> {
  const result = await redis.fetchPlans(
    plansKey() // KEYS[1]
  )

  return parseManyNumbers(result, `PlanCache fetchPlans malformed result`)
}

export async function fetchPlansCache(redis: Redis, planIds: number[]): Promise<PlanCache[]> {
  if (planIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  planIds.forEach((planId) => {
    pipeline.fetchPlanCache(
      planKey(planId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `PlanCache fetchPlansCache malformed result`)
}

export async function savePlanCache(
  redis: Redis,
  planId: number,
  categoriesMax: number,
  priceRub: number,
  durationDays: number,
  intervalSec: number,
  analyticsOn: boolean
): Promise<void> {
  await redis.savePlanCache(
    planKey(planId), // KEYS[1]
    plansKey(), // KEYS[2]
    planId, // ARGV[1]
    categoriesMax, // ARGV[2]
    priceRub, // ARGV[3]
    durationDays, // ARGV[4]
    intervalSec, // ARGV[5]
    analyticsOn ? 1 : 0, // ARGV[6]
    Date.now() // ARGV[7]
  )
}

export async function dropPlanCache(redis: Redis, planId: number): Promise<void> {
  await redis.dropPlanCache(
    planKey(planId), // KEYS[1]
    plansKey(), // KEYS[2]
    planId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): PlanCache => {
  const hash = parseHash(result, 7, message)

  return {
    id: parseNumber(hash[0], message),
    categoriesMax: parseNumber(hash[1], message),
    priceRub: parseNumber(hash[2], message),
    durationDays: parseNumber(hash[3], message),
    intervalSec: parseNumber(hash[4], message),
    analyticsOn: !!parseNumber(hash[5], message),
    time: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): PlanCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
