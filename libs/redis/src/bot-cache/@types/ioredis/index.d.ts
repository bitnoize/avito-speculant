import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchBotCache(botCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchBotsIndex(botsIndexKey: string, callback?: Callback<string>): Result<string, Context>

    fetchRandomBot(botsIndexKey: string, callback?: Callback<string>): Result<string, Context>

    saveBotCache(
      botCacheKey: string,
      botId: number,
      userId: number,
      createdAt: number,
      updatedAt: number,
      queuedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewOnlineBotCache(
      botCacheKey: string,
      onlineBotsIndexKey: string,
      botId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewOfflineBotCache(
      botCacheKey: string,
      onlineBotsIndexKey: string,
      botId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveUserBotsIndex(
      userBotsIndexKey: string,
      botId: number,
      createdAt: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
