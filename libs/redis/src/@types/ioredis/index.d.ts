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
  }
}
