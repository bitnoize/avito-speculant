import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    acquireHeartbeatLock(
      lockKey: string,
      lockSecret: string,
      lockTimeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewalHeartbeatLock(
      lockKey: string,
      lockSecret: string,
      lockTimeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // UserCache
    //

    saveUserCache(
      userKey: string,
      usersKey: string,
      userId: number,
      tgFromId: string,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserCache(userKey: string, callback?: Callback<string>): Result<string, Context>

    dropUserCache(
      userKey: string,
      usersKey: string,
      userId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUsersCacheIndex(usersKey: string, callback?: Callback<string>): Result<string, Context>

    //
    // PlanCache
    //

    savePlanCache(
      planKey: string,
      plansKey: string,
      planId: number,
      categoriesMax: number,
      priceRub: number,
      durationDays: number,
      intervalSec: number,
      analyticsOn: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlanCache(planKey: string, callback?: Callback<string>): Result<string, Context>

    dropPlanCache(
      planKey: string,
      plansKey: string,
      planId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlansCacheIndex(plansKey: string, callback?: Callback<string>): Result<string, Context>

    //
    // SubscriptionCache
    //

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
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchSubscriptionCache(
      subscriptionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    dropSubscriptionCache(
      subscriptionKey: string,
      userSubscriptionKey: string,
      planSubscriptionsKey: string,
      subscriptionId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserSubscriptionCacheIndex(
      userSubscriptionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlanSubscriptionsCacheIndex(
      planSubscriptionsKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // CategoryCache
    //

    saveCategoryCache(
      categoryKey: string,
      userCategoriesKey: string,
      categoryId: number,
      userId: number,
      avitoUrl: string,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchCategoryCache(categoryKey: string, callback?: Callback<string>): Result<string, Context>

    dropCategoryCache(
      categoryKey: string,
      userCategoriesKey: string,
      categoryId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserCategoriesCacheIndex(
      userCategoriesKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    attachScraperCategoryCache(
      scraperCategoriesKey: string,
      categoryId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    detachScraperCategoryCache(
      scraperCategoriesKey: string,
      categoryId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScraperCategoriesCacheIndex(
      scraperCategoriesKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // ScraperCache
    //

    saveScraperCache(
      scraperKey: string,
      scrapersKey: string,
      scraperJobId: string,
      avitoUrl: string,
      intervalSec: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScraperCache(scraperKey: string, callback?: Callback<string>): Result<string, Context>

    dropScraperCache(
      scraperKey: string,
      scrapersKey: string,
      scraperJobId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScrapersCacheIndex(
      scrapersKey: string,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
