import { sql } from 'kysely'
import { Proxy, PROXY_PRODUCE_AFTER } from './proxy.js'
import { ProxyRow } from './proxy.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  proxy_id: number,
  writeLock = false
): Promise<ProxyRow | undefined> {
  const queryBase = trx.selectFrom('proxy').selectAll().where('id', '=', proxy_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByProxyUrl(
  trx: TransactionDatabase,
  proxy_url: string
): Promise<ProxyRow | undefined> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('proxy_url', '=', proxy_url)
    .forShare()
    .executeTakeFirst()
}

export async function selectRows(trx: TransactionDatabase): Promise<ProxyRow[]> {
  return await trx.selectFrom('proxy').selectAll().orderBy('created_at', 'asc').forShare().execute()
}

export async function insertRow(trx: TransactionDatabase, proxy_url: string): Promise<ProxyRow> {
  return await trx
    .insertInto('proxy')
    .values(() => ({
      proxy_url,
      is_enabled: false,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
  trx: TransactionDatabase,
  proxy_id: number,
  is_enabled: boolean
): Promise<ProxyRow> {
  return await trx
    .updateTable('proxy')
    .set(() => ({
      is_enabled,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', proxy_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<ProxyRow[]> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - ${PROXY_PRODUCE_AFTER}::interval`)
    .orderBy('queued_at', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  proxy_ids: number[]
): Promise<ProxyRow[]> {
  if (proxy_ids.length === 0) {
    return []
  }

  return await trx
    .updateTable('proxy')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', proxy_ids)
    .returningAll()
    .execute()
}

export const buildModel = (row: ProxyRow): Proxy => {
  return {
    id: row.id,
    proxyUrl: row.proxy_url,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: ProxyRow[]): Proxy[] => {
  return rows.map((row) => buildModel(row))
}
