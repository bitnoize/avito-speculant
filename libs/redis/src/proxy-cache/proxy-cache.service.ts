import {
  FetchProxyCache,
  FetchProxiesCache,
  FetchOnlineProxiesCache,
  FetchRandomOnlineProxyCache,
  SaveProxyCache,
  SaveOnlineProxyCache,
  SaveOfflineProxyCache
} from './dto/index.js'
import * as proxyCacheRepository from './proxy-cache.repository.js'

/*
 * Fetch ProxyCache
 */
export const fetchProxyCache: FetchProxyCache = async function (redis, request) {
  const proxyCache = await proxyCacheRepository.fetchProxyCache(redis, request.proxyId)

  return { proxyCache }
}

/*
 * Fetch ProxiesCache
 */
export const fetchProxiesCache: FetchProxiesCache = async function (redis) {
  const proxyIds = await proxyCacheRepository.fetchProxiesIndex(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch OnlineProxiesCache
 */
export const fetchOnlineProxiesCache: FetchOnlineProxiesCache = async function (redis) {
  const proxyIds = await proxyCacheRepository.fetchOnlineProxiesIndex(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch Random Online ProxyCache
 */
export const fetchRandomOnlineProxyCache: FetchRandomOnlineProxyCache = async function (redis) {
  const proxyId = await proxyCacheRepository.fetchRandomOnlineProxyId(redis)

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
export const saveProxyCache: SaveProxyCache = async function (redis, request) {
  await proxyCacheRepository.saveProxyCache(
    redis,
    request.proxyId,
    request.url,
    request.isEnabled,
    request.createdAt,
    request.updatedAt,
    request.queuedAt
  )
}

/*
 * Save OnlineProxyCache
 */
export const saveOnlineProxyCache: SaveOnlineProxyCache = async function (redis, request) {
  await proxyCacheRepository.saveOnlineProxyCache(redis, request.proxyId, request.sizeBytes)
}

/*
 * Save OfflineProxyCache
 */
export const saveOfflineProxyCache: SaveOfflineProxyCache = async function (redis, request) {
  await proxyCacheRepository.saveOfflineProxyCache(redis, request.proxyId, request.sizeBytes)
}
