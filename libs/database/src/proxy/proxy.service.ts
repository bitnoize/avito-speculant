import { Notify } from '@avito-speculant/common'
import {
  CreateProxyRequest,
  CreateProxyResponse,
  EnableDisableProxyRequest,
  EnableDisableProxyResponse,
  ListProxiesRequest,
  ListProxiesResponse,
  ProduceProxiesRequest,
  ProduceProxiesResponse,
  ConsumeProxyRequest,
  ConsumeProxyResponse
} from './dto/index.js'
import { Proxy } from './proxy.js'
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

    const existsProxyRow = await proxyRepository.selectRowByProxyUrlForShare(trx, request.proxyUrl)

    if (existsProxyRow !== undefined) {
      throw new ProxyAllreadyExistsError({ request })
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
      throw new ProxyNotFoundError({ request })
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
      throw new ProxyNotFoundError({ request })
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
    const proxyRows = await proxyRepository.selectRowsList(trx, request.all ?? false)

    return {
      proxies: proxyRepository.buildCollection(proxyRows)
    }
  })
}

/**
 * Produce Proxies
 */
export async function produceProxies(
  db: KyselyDatabase,
  request: ProduceProxiesRequest
): Promise<ProduceProxiesResponse> {
  return await db.transaction().execute(async (trx) => {
    const proxies: Proxy[] = []

    const proxyRows = await proxyRepository.selectRowsProduce(trx, request.limit)

    for (const proxyRow of proxyRows) {
      const updatedProxyRow = await proxyRepository.updateRowProduce(trx, proxyRow.id)

      proxies.push(proxyRepository.buildModel(updatedProxyRow))
    }

    return { proxies }
  })
}

/**
 * Consume Proxy
 */
export async function consumeProxy(
  db: KyselyDatabase,
  request: ConsumeProxyRequest
): Promise<ConsumeProxyResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const proxyRow = await proxyRepository.selectRowByIdForUpdate(trx, request.proxyId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError({ request })
    }

    if (proxyRow.is_enabled) {
      // ...
    }

    // ...

    if (!isChanged) {
      return {
        proxy: proxyRepository.buildModel(proxyRow),
        backLog
      }
    }

    const updatedProxyRow = await proxyRepository.updateRowConsume(
      trx,
      proxyRow.id,
      proxyRow.is_enabled
    )

    const proxyLogRow = await proxyLogRepository.insertRow(
      trx,
      updatedProxyRow.id,
      'consume_proxy',
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
