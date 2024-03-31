import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchSubscriptionCache(
      subscriptionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserSubscription(
      userSubscriptionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlanSubscriptions(
      planSubscriptionsKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveSubscriptionCache(
      subscriptionKey: string,
      userSubscriptionKey: string,
      planSubscriptionsKey: string,
      subscriptionId: number,
      userId: number,
      planId: number,
      categoriesMax: number,
      priceRub: number,
      durationDays: number,
      intervalSec: number,
      analyticsOn: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropSubscriptionCache(
      subscriptionKey: string,
      userSubscriptionKey: string,
      planSubscriptionsKey: string,
      subscriptionId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
