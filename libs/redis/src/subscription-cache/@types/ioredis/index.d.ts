import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchSubscriptionCache(
      subscriptionCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

//  fetchSubscriptionLink(
//    subscriptionLinkKey: string, // KEYS[1]
//    callback?: Callback<string>
//  ): Result<string, Context>

    fetchSubscriptionsIndex(
      subscriptionsIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveSubscriptionCache(
      subscriptionCacheKey: string, // KEYS[1]
      subscriptionId: number, // ARGV[1]
      userId: number, // ARGV[2]
      planId: number, // ARGV[3]
      priceRub: number, // ARGV[4]
      status: string, // ARGV[5]
      createdAt: number, // ARGV[6]
      updatedAt: number, // ARGV[7]
      queuedAt: number, // ARGV[8]
      timeoutAt: number, // ARGV[9]
      finishAt: number, // ARGV[10]
      callback?: Callback<string>
    ): Result<string, Context>

//  saveSubscriptionLink(
//    subscriptionLinkKey: string, // KEYS[1]
//    subscriptionId: number, // ARGV[1]
//    callback?: Callback<string>
//  ): Result<string, Context>

    saveSubscriptionsIndex(
      subscriptionsIndexKey: string, // KEYS[1]
      subscriptionId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropSubscriptionCache(
      subscriptionCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

//  dropSubscriptionLink(
//    subscriptionLinkKey: string, // KEYS[1]
//    callback?: Callback<string>
//  ): Result<string, Context>

    dropSubscriptionsIndex(
      subscriptionsIndexKey: string, // KEYS[1]
      subscriptionId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
