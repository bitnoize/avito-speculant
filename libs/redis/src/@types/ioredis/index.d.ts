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

    fetchUserCache(userCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchUsersCacheIndex(
      usersCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserCache(
      userCacheKey: string,
      usersCacheKey: string,
      userId: number,
      tgFromId: string,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropUserCache(
      userCacheKey: string,
      usersCacheKey: string,
      userId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // PlanCache
    //

    fetchPlanCache(planCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchPlansCacheIndex(
      plansCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    savePlanCache(
      planCacheKey: string,
      plansCacheKey: string,
      planId: number,
      categoriesMax: number,
      priceRub: number,
      durationDays: number,
      intervalSec: number,
      analyticsOn: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropPlanCache(
      planCacheKey: string,
      plansCacheKey: string,
      planId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // SubscriptionCache
    //

    fetchSubscriptionCache(
      subscriptionCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserSubscriptionCacheIndex(
      userSubscriptionCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchPlanSubscriptionsCacheIndex(
      planSubscriptionsCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveSubscriptionCache(
      subscriptionCacheKey: string,
      userSubscriptionCacheKey: string,
      planSubscriptionsCacheKey: string,
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

    dropSubscriptionCache(
      subscriptionCacheKey: string,
      userSubscriptionCacheKey: string,
      planSubscriptionsCacheKey: string,
      subscriptionId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // CategoryCache
    //

    fetchCategoryCache(
      categoryCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserCategoriesCacheIndex(
      userCategoriesCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScraperCategoriesCacheIndex(
      scraperCategoriesCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoryCache(
      categoryCacheKey: string,
      userCategoriesCacheKey: string,
      scraperCategoriesCacheKey: string,
      categoryId: number,
      userId: number,
      scraperJobId: string,
      avitoUrl: string,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropCategoryCache(
      categoryCacheKey: string,
      userCategoriesCacheKey: string,
      scraperCategoriesCacheKey: string,
      categoryId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // ProxyCache
    //

    fetchProxyCache(proxyCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchProxiesCacheIndex(
      proxiesCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveProxyCache(
      proxyCacheKey: string,
      onlineProxiesCacheKey: string,
      offlineProxiesCacheKey: string,
      proxyId: number,
      proxyUrl: string,
      isOnline: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxyCache(
      proxyCacheKey: string,
      onlineProxiesCacheKey: string,
      offlineProxiesCacheKey: string,
      proxyId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    //
    // ScraperCache
    //

    fetchScraperCache(scraperCacheKey: string, callback?: Callback<string>): Result<string, Context>

    findScraperCacheAvitoUrlIndex(
      scraperCacheAvitoUrlKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchScrapersCacheIndex(
      scrapersCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveScraperCache(
      scraperCacheKey: string,
      scraperCacheAvitoUrlKey: string,
      scrapersCacheKey: string,
      scraperJobId: string,
      avitoUrl: string,
      intervalSec: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperCache(
      scraperCacheKey: string,
      scraperCacheAvitoUrlKey: string,
      scrapersCacheKey: string,
      scraperJobId: string,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
