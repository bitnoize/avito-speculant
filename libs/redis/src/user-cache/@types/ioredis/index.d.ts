import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchUserCache(
      userCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUserLink(
      userLinkKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUsersIndex(
      usersIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserCache(
      userCacheKey: string, // KEYS[1]
      userId: number, // ARGV[1]
      tgFromId: string, // ARGV[2]
      subscriptions: number, // ARGV[3]
      categories: number, // ARGV[4]
      bots: number, // ARGV[5]
      createdAt: number, // ARGV[6]
      updatedAt: number, // ARGV[7]
      queuedAt: number, // ARGV[8]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserPaidCache(
      userCacheKey: string, // KEYS[1]
      activeSubscriptionId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserUnpaidCache(
      userCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserLink(
      userLinkKey: string, // KEYS[1]
      userId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserLinkTimeout(
      userLinkKey: string, // KEYS[1]
      userId: number, // ARGV[1]
      timeout: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    saveUsersIndex(
      usersIndexKey: string, // KEYS[1]
      userId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropUserCache(
      userCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropUserLink(
      userLinkKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropUsersIndex(
      usersIndexKey: string, // KEYS[1]
      userId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
