import { sql } from 'kysely'
import { Notify } from '@avito-speculant/common'
import { ProxyLog, ProxyLogData } from './proxy-log.js'
import { ProxyLogRow } from './proxy-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowsByProxyId(
  trx: TransactionDatabase,
  proxy_id: number,
  limit: number
): Promise<ProxyLogRow[]> {
  return await trx
    .selectFrom('proxy_log')
    .selectAll()
    .where('proxy_id', '=', proxy_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .forShare()
    .execute()
}

export async function insertRow(
  trx: TransactionDatabase,
  proxy_id: number,
  action: string,
  is_enabled: boolean,
  data: ProxyLogData
): Promise<ProxyLogRow> {
  return await trx
    .insertInto('proxy_log')
    .values(() => ({
      proxy_id,
      action,
      is_enabled,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: ProxyLogRow): ProxyLog => {
  return {
    id: row.id,
    proxyId: row.proxy_id,
    action: row.action,
    isEnabled: row.is_enabled,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: ProxyLogRow[]): ProxyLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: ProxyLogRow): Notify => {
  return ['proxy', row.id, row.proxy_id, row.action]
}
