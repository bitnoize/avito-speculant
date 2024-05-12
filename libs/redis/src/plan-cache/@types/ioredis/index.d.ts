import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchPlanCache(
      planCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlansIndex(
      plansIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    savePlanCache(
      planCacheKey: string, // KEYS[1]
      planId: number, // ARGV[1]
      categoriesMax: number, // ARGV[2]
      durationDays: number, // ARGV[3]
      intervalSec: number, // ARGV[4]
      analyticsOn: number, // ARGV[5]
      priceRub: number, // ARGV[6]
      isEnabled: number, // ARGV[7]
      subscriptions: number, // ARGV[8]
      createdAt: number, // ARGV[9]
      updatedAt: number, // ARGV[10]
      queuedAt: number, // ARGV[11]
      callback?: Callback<string>
    ): Result<string, Context>

    savePlansIndex(
      plansIndexKey: string, // KEYS[1]
      planId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropPlanCache(
      planCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropPlansIndex(
      plansIndexKey: string, // KEYS[1]
      planId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
