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
      active_subscription_id: number | null, // ARGV[3]
      subscriptions: number, // ARGV[4]
      categories: number, // ARGV[5]
      bots: number, // ARGV[6]
      createdAt: number, // ARGV[7]
      updatedAt: number, // ARGV[8]
      queuedAt: number, // ARGV[9]
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
