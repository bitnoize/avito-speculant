import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchBotCache(
      botCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchBotsIndex(
      botsIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveBotCache(
      botCacheKey: string, // KEYS[1]
      botId: number, // ARGV[1]
      userId: number, // ARGV[2]
      token: string, // ARGV[3]
      isLinked: number, // ARGV[4]
      isEnabled: number, // ARGV[5]
      createdAt: number, // ARGV[6]
      updatedAt: number, // ARGV[7]
      queuedAt: number, // ARGV[8]
      callback?: Callback<string>
    ): Result<string, Context>

    saveBotsIndex(
      botsIndexKey: string, // KEYS[1]
      botId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    saveOnlineBotCache(
      botCacheKey: string, // KEYS[1]
      tgFromId: string, // ARGV[1]
      username: string, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    saveOfflineBotCache(
      botCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropBotCache(
      botCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropBotsIndex(
      botsIndexKey: string, // KEYS[1]
      botId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
