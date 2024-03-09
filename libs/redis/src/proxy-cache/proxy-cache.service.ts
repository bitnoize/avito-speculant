import { Redis } from 'ioredis'
import {
  FetchProxyCacheRequest,
  FetchProxyCacheResponse,
  ListProxiesCacheRequest,
  ListProxiesCacheResponse,
  SaveProxyCacheRequest,
  SaveProxyCacheResponse,
  DropProxyCacheRequest,
  DropProxyCacheResponse
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

  return {
    message: `ProxyCache successfully fetched`,
    statusCode: 200,
    proxyCache
  }
}

/*
 * List ProxyCache
 */
export async function listProxiesCache(
  redis: Redis,
  request: ListProxiesCacheRequest
): Promise<ListProxiesCacheResponse> {
  const proxyIds = await proxyCacheRepository.fetchIndex(redis, request.isOnline)
  const proxiesCache = await proxyCacheRepository.fetchCollection(redis, proxyIds)

  return {
    message: `ProxiesCache successfully listed`,
    statusCode: 200,
    proxiesCache
  }
}

/*
 * Save ProxyCache
 */
export async function saveProxyCache(
  redis: Redis,
  request: SaveProxyCacheRequest
): Promise<SaveProxyCacheResponse> {
  await proxyCacheRepository.saveModel(redis, request.proxyId, request.proxyUrl, request.isOnline)

  return {
    message: `ProxyCache successfully saved`,
    statusCode: 200
  }
}

/*
 * Drop ProxyCache
 */
export async function dropProxyCache(
  redis: Redis,
  request: DropProxyCacheRequest
): Promise<DropProxyCacheResponse> {
  await proxyCacheRepository.dropModel(redis, request.proxyId)

  return {
    message: `ProxyCache successfully dropped`,
    statusCode: 200
  }
}
