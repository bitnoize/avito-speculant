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

    cacheStoreUserModel(
      userModelKey: string,
      id: number,
      tg_from_id: string,
      status: string,
      subscriptions: number,
      categories: number,
      created_at: number,
      updated_at: number,
      queued_at: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchUserModel(
      userModelKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStorePlanModel(
      planModelKey: string,
      id: number,
      categories_max: number,
      price_rub: number,
      duration_days: number,
      interval_sec: number,
      analytics_on: number,
      is_enabled: number,
      subscriptions: number,
      created_at: number,
      updated_at: number,
      queued_at: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchPlanModel(
      planModelKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStorePlanCollection(
      planCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchPlanCollection(
      planCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStoreSubscriptionModel(
      subscriptionModelKey: string,
      id: number,
      user_id: number,
      plan_id: number,
      categories_max: number,
      price_rub: number,
      duration_days: number,
      interval_sec: number,
      analytics_on: boolean,
      status: string,
      created_at: number,
      updated_at: number,
      queued_at: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchSubscriptionModel(
      subscriptionModelKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStoreSubscriptionCollection(
      subscriptionCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchSubscriptionCollection(
      subscriptionCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStoreCategoryModel(
      categoryModelKey: string,
      id: number,
      user_id: number,
      avito_url: string,
      is_enabled: number,
      created_at: number,
      updated_at: number,
      queued_at: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchCategoryModel(
      categoryModelKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheStoreCategoryCollection(
      categoryCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    cacheFetchCategoryCollection(
      categoryCollectionKey: string,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
