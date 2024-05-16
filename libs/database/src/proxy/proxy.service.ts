import { Notify } from '@avito-speculant/common'
import {
  CreateProxy,
  EnableProxy,
  DisableProxy,
  ProduceProxies,
  ConsumeProxy
} from './dto/index.js'
import {
  ProxyNotFoundError,
  ProxyExistsError,
  ProxyIsEnabledError,
  ProxyIsDisabledError,
} from './proxy.errors.js'
import * as proxyRepository from './proxy.repository.js'
import * as proxyLogRepository from '../proxy-log/proxy-log.repository.js'

/**
 * Create Proxy
 */
export const createProxy: CreateProxy = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsProxyRow = await proxyRepository.selectRowByUrl(trx, request.url)

    if (existsProxyRow !== undefined) {
      throw new ProxyExistsError({ request })
    }

    const insertedProxyRow = await proxyRepository.insertRow(trx, request.url)

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
export const enableProxy: EnableProxy = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const proxyRow = await proxyRepository.selectRowById(trx, request.proxyId, true)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError({ request })
    }

    if (proxyRow.is_enabled) {
      throw new ProxyIsEnabledError({ request, proxyRow })
    }

    proxyRow.is_enabled = true

    const updatedProxyRow = await proxyRepository.updateRowState(
      trx,
      proxyRow.id,
      proxyRow.is_enabled
    )

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
export const disableProxy: DisableProxy = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const proxyRow = await proxyRepository.selectRowById(trx, request.proxyId, true)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError({ request })
    }

    if (!proxyRow.is_enabled) {
      throw new ProxyIsDisabledError({ request, proxyRow })
    }

    proxyRow.is_enabled = false

    const updatedProxyRow = await proxyRepository.updateRowState(
      trx,
      proxyRow.id,
      proxyRow.is_enabled
    )

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
 * Produce Proxies
 */
export const produceProxies: ProduceProxies = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const proxyRows = await proxyRepository.selectRowsProduce(trx, request.limit)

    const updatedProxyRows = await proxyRepository.updateRowsProduce(
      trx,
      proxyRows.map((proxyRow) => proxyRow.id)
    )

    return {
      proxies: proxyRepository.buildCollection(updatedProxyRows)
    }
  })
}

/**
 * Consume Proxy
 */
export const consumeProxy: ConsumeProxy = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const proxyRow = await proxyRepository.selectRowById(trx, request.entityId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError({ request })
    }

    return {
      proxy: proxyRepository.buildModel(proxyRow)
    }
  })
}
