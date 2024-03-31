import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchPlanCache(planKey: string, callback?: Callback<string>): Result<string, Context>

    fetchPlans(plansKey: string, callback?: Callback<string>): Result<string, Context>

    savePlanCache(
      planKey: string,
      plansKey: string,
      planId: number,
      categoriesMax: number,
      priceRub: number,
      durationDays: number,
      intervalSec: number,
      analyticsOn: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropPlanCache(
      planKey: string,
      plansKey: string,
      planId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
