import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchUserCache(userKey: string, callback?: Callback<string>): Result<string, Context>

    fetchUsers(usersKey: string, callback?: Callback<string>): Result<string, Context>

    saveUserCache(
      userKey: string,
      usersKey: string,
      userId: number,
      tgFromId: string,
      checkpoint: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropUserCache(
      userKey: string,
      usersKey: string,
      userId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
