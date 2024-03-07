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
import { ProxyNotFoundError } from './proxy.errors.js'
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

    // ...

    const insertedProxyRow = await proxyRepository.insertRow(trx, request.proxyUrl)

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      insertedProxyRow.id,
      'create_proxy',
      insertedProxyRow.is_enabled,
      insertedProxyRow.is_online,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      message: `Proxy successfully created`,
      statusCode: 201,
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
        message: `Proxy allready enabled`,
        statusCode: 200,
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
      updatedProxyRow.is_online,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      message: `Proxy successfully enabled`,
      statusCode: 201,
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
        message: `Proxy allready disabled`,
        statusCode: 200,
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
      updatedProxyRow.is_online,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      message: `Proxy successfully disabled`,
      statusCode: 201,
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
      message: `Proxies successfully listed`,
      statusCode: 200,
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
      message: `Proxies successfully enqueued`,
      statusCode: 200,
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
        message: `Proxy not changed`,
        statusCode: 200,
        proxy: proxyRepository.buildModel(proxyRow),
        backLog
      }
    }

    const updatedProxyRow = await proxyRepository.updateRowBusiness(
      trx,
      proxyRow.id,
      proxyRow.is_enabled,
      proxyRow.is_online
    )

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      updatedProxyRow.id,
      'business_proxy',
      updatedProxyRow.is_enabled,
      updatedProxyRow.is_online,
      request.data
    )

    backLog.push(proxyLogRepository.buildNotify(proxyLogRow))

    return {
      message: `Proxy successfully processed`,
      statusCode: 201,
      proxy: proxyRepository.buildModel(updatedProxyRow),
      backLog
    }
  })
}
