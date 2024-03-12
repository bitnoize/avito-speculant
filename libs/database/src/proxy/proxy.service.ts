import { Notify } from '@avito-speculant/notify'
import {
  CreateProxyRequest,
  CreateProxyResponse,
  EnableDisableProxyRequest,
  EnableDisableProxyResponse,
  ListProxiesRequest,
  ListProxiesResponse,
  QueueProxiesRequest,
  QueueProxiesResponse,
  BusinessProxyRequest,
  BusinessProxyResponse
} from './dto/index.js'
import { DEFAULT_PROXY_LIST_ALL, DEFAULT_PROXY_QUEUE_LIMIT, Proxy } from './proxy.js'
import { ProxyNotFoundError, ProxyAllreadyExistsError } from './proxy.errors.js'
import * as proxyRepository from './proxy.repository.js'
import * as proxyLogRepository from '../proxy-log/proxy-log.repository.js'
import { KyselyDatabase } from '../database.js'

/**
 * Create Proxy
 */
export async function createProxy(
  db: KyselyDatabase,
  request: CreateProxyRequest
): Promise<CreateProxyResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsProxyRow =
      await proxyRepository.selectRowByProxyUrlForShare(trx, request.proxyUrl)

    if (existsProxyRow !== undefined) {
      throw new ProxyAllreadyExistsError<CreateProxyRequest>(request)
    }

    // ...

    const insertedProxyRow = await proxyRepository.insertRow(trx, request.proxyUrl)

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      insertedProxyRow.id,
      'create_proxy',
      insertedProxyRow.is_enabled,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      proxy: proxyRepository.buildModel(insertedProxyRow),
      backLog
    }
  })
}

/**
 * Enable Proxy
 */
export async function enableProxy(
  db: KyselyDatabase,
  request: EnableDisableProxyRequest
): Promise<EnableDisableProxyResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const proxyRow = await proxyRepository.selectRowByIdForUpdate(trx, request.proxyId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError<EnableDisableProxyRequest>(request)
    }

    if (proxyRow.is_enabled) {
      return {
        proxy: proxyRepository.buildModel(proxyRow),
        backLog
      }
    }

    // ...

    const updatedProxyRow = await proxyRepository.updateRowIsEnabled(trx, proxyRow.id, true)

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      updatedProxyRow.id,
      'enable_proxy',
      updatedProxyRow.is_enabled,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      proxy: proxyRepository.buildModel(updatedProxyRow),
      backLog
    }
  })
}

/**
 * Disable Proxy
 */
export async function disableProxy(
  db: KyselyDatabase,
  request: EnableDisableProxyRequest
): Promise<EnableDisableProxyResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const proxyRow = await proxyRepository.selectRowByIdForUpdate(trx, request.proxyId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError<EnableDisableProxyRequest>(request)
    }

    if (!proxyRow.is_enabled) {
      return {
        proxy: proxyRepository.buildModel(proxyRow),
        backLog
      }
    }

    // ...

    const updatedProxyRow = await proxyRepository.updateRowIsEnabled(trx, proxyRow.id, false)

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      updatedProxyRow.id,
      'disable_proxy',
      updatedProxyRow.is_enabled,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      proxy: proxyRepository.buildModel(updatedProxyRow),
      backLog
    }
  })
}

/**
 * List Proxies
 */
export async function listProxies(
  db: KyselyDatabase,
  request: ListProxiesRequest
): Promise<ListProxiesResponse> {
  return await db.transaction().execute(async (trx) => {
    const proxyRows = await proxyRepository.selectRowsList(
      trx,
      (request.all ??= DEFAULT_PROXY_LIST_ALL)
    )

    return {
      proxies: proxyRepository.buildCollection(proxyRows),
      all: request.all
    }
  })
}

/**
 * Queue Proxies
 */
export async function queueProxies(
  db: KyselyDatabase,
  request: QueueProxiesRequest
): Promise<QueueProxiesResponse> {
  return await db.transaction().execute(async (trx) => {
    const proxies: Proxy[] = []

    const proxyRows = await proxyRepository.selectRowsSkipLockedForUpdate(
      trx,
      (request.limit ??= DEFAULT_PROXY_QUEUE_LIMIT)
    )

    for (const proxyRow of proxyRows) {
      const updatedProxyRow = await proxyRepository.updateRowQueuedAt(trx, proxyRow.id)

      proxies.push(proxyRepository.buildModel(updatedProxyRow))
    }

    return {
      proxies,
      limit: request.limit
    }
  })
}

/**
 * Business Proxy
 */
export async function businessProxy(
  db: KyselyDatabase,
  request: BusinessProxyRequest
): Promise<BusinessProxyResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const proxyRow = await proxyRepository.selectRowByIdForUpdate(trx, request.proxyId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError<BusinessProxyRequest>(request)
    }

    if (proxyRow.is_enabled) {
      // TODO
    }

    // ...

    if (!isChanged) {
      return {
        proxy: proxyRepository.buildModel(proxyRow),
        backLog
      }
    }

    const updatedProxyRow = await proxyRepository.updateRowBusiness(
      trx,
      proxyRow.id,
      proxyRow.is_enabled
    )

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      updatedProxyRow.id,
      'business_proxy',
      updatedProxyRow.is_enabled,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      proxy: proxyRepository.buildModel(updatedProxyRow),
      backLog
    }
  })
}
