import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchProxyCache(proxyCacheKey: string, callback?: Callback<string>): Result<string, Context>

    fetchProxiesIndex(proxiesIndexKey: string, callback?: Callback<string>): Result<string, Context>

    fetchRandomProxy(proxiesKey: string, callback?: Callback<string>): Result<string, Context>

    saveProxyCache(
      proxyCacheKey: string,
      proxyId: number,
      url: string,
      isEnabled: number,
      createdAt: number,
      updatedAt: number,
      queuedAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveProxiesIndex(
      proxiesIndexKey: string,
      proxyId: number,
      createdAt: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxiesIndex(
      proxiesIndexKey: string,
      proxyId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveOnlineProxyCache(
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>

    saveOfflineProxyCache(
      proxyCacheKey: string,
      sizeBytes: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
