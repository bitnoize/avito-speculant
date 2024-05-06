import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchPlanCache(planCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchPlans(plansIndexKey: string, callback?: Callback<string>): Result<string, Context>

    savePlanCache(
      planCacheKey: string,
      planId: number,
      categoriesMax: number,
      durationDays: number,
      intervalSec: number,
      analyticsOn: number,
      priceRub: number,
      isEnabled: number,
      subscriptions: number,
      createdAt: number,
      updatedAt: number,
      queuedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    savePlansIndex(
      plansIndexKey: string,
      planId: number,
      createdAt: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
