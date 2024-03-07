import { sql } from 'kysely'
import { Proxy } from './proxy.js'
import { ProxyRow } from './proxy.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
  proxy_id: number
): Promise<ProxyRow | undefined> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('id', '=', proxy_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByIdForUpdate(
  trx: TransactionDatabase,
  proxy_id: number
): Promise<ProxyRow | undefined> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('id', '=', proxy_id)
    .forUpdate()
    .executeTakeFirst()
}

export async function insertRow(trx: TransactionDatabase, proxy_url: string): Promise<ProxyRow> {
  return await trx
    .insertInto('proxy')
    .values(() => ({
      proxy_url,
      is_enabled: false,
      is_online: false,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowIsEnabled(
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

export async function selectRowsList(trx: TransactionDatabase, all: boolean): Promise<ProxyRow[]> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('is_enabled', 'in', all ? [true, false] : [true])
    .forShare()
    .orderBy('id', 'asc')
    .execute()
}

export async function selectRowsSkipLockedForUpdate(
  trx: TransactionDatabase,
  limit: number
): Promise<ProxyRow[]> {
  return await trx
    .selectFrom('proxy')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - interval '1 MINUTE'`)
    .orderBy('queued_at', 'desc')
    .forUpdate()
    .skipLocked()
    .limit(limit)
    .execute()
}

export async function updateRowQueuedAt(
  trx: TransactionDatabase,
  proxy_id: number
): Promise<ProxyRow> {
  return await trx
    .updateTable('proxy')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', '=', proxy_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowBusiness(
  trx: TransactionDatabase,
  proxy_id: number,
  is_enabled: boolean,
  is_online: boolean
): Promise<ProxyRow> {
  return await trx
    .updateTable('proxy')
    .set(() => ({
      is_enabled,
      is_online,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', proxy_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: ProxyRow): Proxy => {
  return {
    id: row.id,
    proxyUrl: row.proxy_url,
    isEnabled: row.is_enabled,
    isOnline: row.is_online,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: ProxyRow[]): Proxy[] => {
  return rows.map((row) => buildModel(row))
}
