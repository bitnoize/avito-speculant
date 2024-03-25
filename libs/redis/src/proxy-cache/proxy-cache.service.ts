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
  const proxyCache = await proxyCacheRepository.fetchModel(redis, request.proxyId)

  return { proxyCache }
}

/*
 * Fetch ProxiesCache
 */
export async function fetchProxiesCache(redis: Redis): Promise<FetchProxiesCacheResponse> {
  const proxyIds = await proxyCacheRepository.fetchIndex(redis)
  const proxiesCache = await proxyCacheRepository.fetchCollection(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch ProxiesCache Online
 */
export async function fetchProxiesCacheOnline(redis: Redis): Promise<FetchProxiesCacheResponse> {
  const proxyIds = await proxyCacheRepository.fetchOnlineIndex(redis)
  const proxiesCache = await proxyCacheRepository.fetchCollection(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Random ProxyCache Online
 */
export async function randomProxyCacheOnline(redis: Redis): Promise<RandomProxyCacheResponse> {
  const proxyId = await proxyCacheRepository.randomOnlineIndex(redis)

  if (proxyId === undefined) {
    return {}
  }

  const proxyCache = await proxyCacheRepository.fetchModel(redis, proxyId)

  return { proxyCache }
}

/*
 * Save ProxyCache
 */
export async function saveProxyCache(redis: Redis, request: SaveProxyCacheRequest): Promise<void> {
  await proxyCacheRepository.saveModel(redis, request.proxyId, request.proxyUrl)
}

/*
 * Drop ProxyCache
 */
export async function dropProxyCache(redis: Redis, request: DropProxyCacheRequest): Promise<void> {
  await proxyCacheRepository.dropModel(redis, request.proxyId)
}

/*
 * Renew ProxyCache Online
 */
export async function renewProxyCacheOnline(
  redis: Redis,
  request: RenewProxyCacheRequest
): Promise<void> {
  await proxyCacheRepository.renewOnline(redis, request.proxyId, request.sizeBytes)
}

/*
 * Renew ProxyCache Offline
 */
export async function renewProxyCacheOffline(
  redis: Redis,
  request: RenewProxyCacheRequest
): Promise<void> {
  await proxyCacheRepository.renewOffline(redis, request.proxyId, request.sizeBytes)
}
