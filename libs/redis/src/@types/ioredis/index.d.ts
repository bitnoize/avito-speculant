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
      callback?: Callback<string>
    ): Result<string, Context>

    dropUserCache(
      userCacheKey: string,
      usersCacheKey: string,
      userId: number,
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
      callback?: Callback<string>
    ): Result<string, Context>

    dropPlanCache(
      planCacheKey: string,
      plansCacheKey: string,
      planId: number,
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
      callback?: Callback<string>
    ): Result<string, Context>

    dropSubscriptionCache(
      subscriptionCacheKey: string,
      userSubscriptionCacheKey: string,
      planSubscriptionsCacheKey: string,
      subscriptionId: number,
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
      scraperId: string,
      avitoUrl: string,
      callback?: Callback<string>
    ): Result<string, Context>

    dropCategoryCache(
      categoryCacheKey: string,
      userCategoriesCacheKey: string,
      scraperCategoriesCacheKey: string,
      categoryId: number,
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

    randomProxyCacheIndex(
      proxiesCacheKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    saveProxyCache(
      proxyCacheKey: string,
      proxiesCacheKey: string,
      proxyId: number,
      proxyUrl: string,
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxyCache(
      proxyCacheKey: string,
      proxiesCacheKey: string,
      proxiesCacheOnlineKey: string,
      proxyId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewProxyCacheOnline(
      proxyCacheKey: string,
      proxiesCacheOnlineKey: string,
      proxyId: number,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewProxyCacheOffline(
      proxyCacheKey: string,
      proxiesCacheOnlineKey: string,
      proxyId: number,
      sizeBytes: number,
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
      scraperId: string,
      avitoUrl: string,
      intervalSec: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropScraperCache(
      scraperCacheKey: string,
      scraperCacheAvitoUrlKey: string,
      scrapersCacheKey: string,
      scraperId: string,
      callback?: Callback<string>
    ): Result<string, Context>

    renewScraperCacheSuccess(
      scraperCacheKey: string,
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewScraperCacheFailed(
      scraperCacheKey: string,
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
