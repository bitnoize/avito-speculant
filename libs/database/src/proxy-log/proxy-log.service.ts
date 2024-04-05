import { ListProxyLogs } from './dto/index.js'
import { ProxyNotFoundError } from '../proxy/proxy.errors.js'
import * as proxyLogRepository from './proxy-log.repository.js'
import * as proxyRepository from '../proxy/proxy.repository.js'

/*
 * List ProxyLogs
 */
export const listProxyLogs: ListProxyLogs = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const proxyRow = await proxyRepository.selectRowByIdForShare(trx, request.proxyId)

    if (proxyRow === undefined) {
      throw new ProxyNotFoundError({ request })
    }

    const proxyLogRows = await proxyLogRepository.selectRowsList(trx, proxyRow.id, request.limit)

    return {
      proxyLogs: proxyLogRepository.buildCollection(proxyLogRows)
    }
  })
}
