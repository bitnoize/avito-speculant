import { ListProxyLogsRequest, ListProxyLogsResponse } from './dto/index.js'
import { ProxyNotFoundError } from '../proxy/proxy.errors.js'
import * as proxyLogRepository from './proxy-log.repository.js'
import * as proxyRepository from '../proxy/proxy.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List ProxyLogs
 */
export async function listProxyLogs(
  db: KyselyDatabase,
  request: ListProxyLogsRequest
): Promise<ListProxyLogsResponse> {
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
