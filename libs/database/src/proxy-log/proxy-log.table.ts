import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { ProxyLogData } from './proxy-log.js'

export interface ProxyLogTable {
  id: Generated<string>
  proxy_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  is_enabled: ColumnType<boolean, boolean, never>
  is_online: ColumnType<boolean, boolean, never>
  data: ColumnType<ProxyLogData, ProxyLogData, never>
  created_at: ColumnType<number, number, never>
}

export type ProxyLogRow = Selectable<ProxyLogTable>
export type InsertableProxyLogRow = Insertable<ProxyLogTable>
