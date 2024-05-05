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

export const proxyKey = (proxyId: number) => [REDIS_CACHE_PREFIX, 'proxy', proxyId].join(':')

export const proxiesKey = () => [REDIS_CACHE_PREFIX, 'proxies'].join(':')

export const onlineProxiesKey = () => [REDIS_CACHE_PREFIX, 'online-proxies'].join(':')
