import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ProxyCache {
  id: number
  proxyUrl: string
  isOnline: boolean
  totalCount: number
  successCount: number
}

export const proxyCacheKey = (proxyId: number) => [REDIS_CACHE_PREFIX, 'proxy', proxyId].join(':')

export const proxiesCacheKey = () => [REDIS_CACHE_PREFIX, 'proxies'].join(':')

export const proxiesCacheOnlineKey = () => [REDIS_CACHE_PREFIX, 'proxies-online'].join(':')
