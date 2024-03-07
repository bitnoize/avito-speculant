import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ProxyCache {
  id: number
  proxyUrl: string
  isOnline: boolean
  totalCount: number
  successCount: number
}

export const proxyCacheKey = (proxyId: number) => [REDIS_CACHE_PREFIX, 'proxy', proxyId].join(':')

export const proxiesCacheKey = (isOnline: boolean) =>
  [REDIS_CACHE_PREFIX, 'proxy', isOnline ? 'online' : 'offline'].join(':')
