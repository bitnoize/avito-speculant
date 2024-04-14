import {
  FetchProxyCache,
  FetchProxiesCache,
  FetchOnlineProxiesCache,
  FetchRandomOnlineProxyCache,
  SaveProxyCache,
  DropProxyCache,
  RenewOnlineProxyCache,
  RenewOfflineProxyCache
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
  const proxyIds = await proxyCacheRepository.fetchProxies(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch Online ProxiesCache
 */
export const fetchOnlineProxiesCache: FetchOnlineProxiesCache = async function (redis) {
  const proxyIds = await proxyCacheRepository.fetchOnlineProxies(redis)
  const proxiesCache = await proxyCacheRepository.fetchProxiesCache(redis, proxyIds)

  return { proxiesCache }
}

/*
 * Fetch Random Online ProxyCache
 */
export const fetchRandomOnlineProxyCache: FetchRandomOnlineProxyCache = async function (redis) {
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
export const saveProxyCache: SaveProxyCache = async function (redis, request) {
  await proxyCacheRepository.saveProxyCache(redis, request.proxyId, request.proxyUrl)
}

/*
 * Drop ProxyCache
 */
export const dropProxyCache: DropProxyCache = async function (redis, request) {
  await proxyCacheRepository.dropProxyCache(redis, request.proxyId)
}

/*
 * Renew Online ProxyCache
 */
export const renewOnlineProxyCache: RenewOnlineProxyCache = async function (redis, request) {
  await proxyCacheRepository.renewOnlineProxyCache(redis, request.proxyId, request.sizeBytes)
}

/*
 * Renew Offline ProxyCache
 */
export const renewOfflineProxyCache: RenewOfflineProxyCache = async function (redis, request) {
  await proxyCacheRepository.renewOfflineProxyCache(redis, request.proxyId, request.sizeBytes)
}
