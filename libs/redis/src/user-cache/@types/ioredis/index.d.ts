import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchUserCache(userCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchTelegramUserId(
      telegramUserIdKey: string,
      callback?: Callback<string>
    ): Result<string, Context>
    
    fetchWebappUserId(
      webappUserIdKey: string,
      callback?: Callback<string>
    ): Result<string, Context>

    fetchUsersIndex(usersIndexKey: string, callback?: Callback<string>): Result<string, Context>

    saveUserCache(
      userKey: string,
      userId: number,
      tgFromId: string,
      isPaid: number,
      subscriptionId: number | null,
      subscriptions: number,
      categories: number,
      bots: number,
      createdAt: number,
      updatedAt: number,
      queuedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    appendUsersIndex(
      usersIndexKey: string,
      userId: number,
      createdAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveTelegramUserId(
      telegramUserIdKey: string,
      userId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveWebappUserId(
      webappUserIdKey: string,
      userId: number,
      timeout: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
