import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchProxyCache(proxyKey: string, callback?: Callback<string>): Result<string, Context>

    fetchProxies(proxiesKey: string, callback?: Callback<string>): Result<string, Context>

    fetchRandomProxy(proxiesKey: string, callback?: Callback<string>): Result<string, Context>

    saveProxyCache(
      proxyKey: string,
      proxiesKey: string,
      proxyId: number,
      proxyUrl: string,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropProxyCache(
      proxyKey: string,
      proxiesKey: string,
      onlineProxiesKey: string,
      proxyId: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewOnlineProxyCache(
      proxyKey: string,
      onlineProxiesKey: string,
      proxyId: number,
      sizeBytes: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    renewOfflineProxyCache(
      proxyKey: string,
      onlineProxiesKey: string,
      proxyId: number,
      sizeBytes: number,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
