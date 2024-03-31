import { Redis } from 'ioredis'
import {
  FetchProxyCacheRequest,
  FetchProxyCacheResponse,
  FetchProxiesCacheResponse,
  RandomProxyCacheResponse,
  SaveProxyCacheRequest,
  DropProxyCacheRequest,
  RenewProxyCacheRequest
} from './dto/index.js'
import * as proxyCacheRepository from './proxy-cache.repository.js'

/*
 * Fetch ProxyCache
 */
export async function fetchProxyCache(
  redis: Redis,
  request: FetchProxyCacheRequest
): Promise<FetchProxyCacheResponse> {
  const proxyCache = await proxyCacheRepository.fetchProxyCache(redis, request.proxyId)

  return { proxyCache }
}

/*
 * Fetch ProxiesCache
 */
export async function fetchProxiesCache(redis: Redis): Promise<FetchProxiesCacheResponse> {
  const proxyIds = await proxyCacheRepository.fetchProxies(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch online ProxiesCache
 */
export async function fetchOnlineProxiesCache(redis: Redis): Promise<FetchProxiesCacheResponse> {
  const proxyIds = await proxyCacheRepository.fetchOnlineProxies(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch random online ProxyCache
 */
export async function fetchRandomOnlineProxyCache(redis: Redis): Promise<RandomProxyCacheResponse> {
  const proxyId = await proxyCacheRepository.fetchRandomOnlineProxy(redis)

  if (proxyId === undefined) {
    return {
      proxyCache: undefined
    }
  }

  const proxyCache = await proxyCacheRepository.fetchProxyCache(redis, proxyId)

  return { proxyCache }
}

/*
 * Save ProxyCache
 */
export async function saveProxyCache(redis: Redis, request: SaveProxyCacheRequest): Promise<void> {
  await proxyCacheRepository.saveProxyCache(redis, request.proxyId, request.proxyUrl)
}

/*
 * Drop ProxyCache
 */
export async function dropProxyCache(redis: Redis, request: DropProxyCacheRequest): Promise<void> {
  await proxyCacheRepository.dropProxyCache(redis, request.proxyId)
}

/*
 * Renew Online ProxyCache
 */
export async function renewOnlineProxyCache(
  redis: Redis,
  request: RenewProxyCacheRequest
): Promise<void> {
  await proxyCacheRepository.renewOnlineProxyCache(redis, request.proxyId, request.sizeBytes)
}

/*
 * Renew Offline ProxyCache
 */
export async function renewOfflineProxyCache(
  redis: Redis,
  request: RenewProxyCacheRequest
): Promise<void> {
  await proxyCacheRepository.renewOfflineProxyCache(redis, request.proxyId, request.sizeBytes)
}
