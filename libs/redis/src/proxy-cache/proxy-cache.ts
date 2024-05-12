import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ProxyCache {
  id: number
  url: string
  isEnabled: boolean
  isOnline: boolean
  totalCount: number
  successCount: number
  sizeBytes: number
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const proxyCacheKey = (proxyId: number) =>
  [REDIS_CACHE_PREFIX, 'proxy-cache', proxyId].join(':')

export const proxiesIndexKey = () => [REDIS_CACHE_PREFIX, 'proxies-index'].join(':')

export const onlineProxiesIndexKey = () => [REDIS_CACHE_PREFIX, 'online-proxies-index'].join(':')
