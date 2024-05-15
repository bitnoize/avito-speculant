import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchProxyCache(
      proxyCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchProxiesIndex(
      proxiesIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchRandomProxyLink(
      proxyLinkKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveProxyCache(
      proxyCacheKey: string, // KEYS[1]
      proxyId: number, // ARGV[1]
      url: string, // ARGV[2]
      isEnabled: number, // ARGV[3]
      createdAt: number, // ARGV[4]
      updatedAt: number, // ARGV[5]
      queuedAt: number, // ARGV[6]
      callback?: Callback<string>
    ): Result<string, Context>

    saveProxiesIndex(
      proxiesIndexKey: string, // KEYS[1]
      proxyId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    saveOnlineProxyCache(
      proxyCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveOfflineProxyCache(
      proxyCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxyCache(
      proxyCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxiesIndex(
      proxiesIndexKey: string, // KEYS[1]
      proxyId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
