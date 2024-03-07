import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface ProxyTable {
  id: Generated<number>
  proxy_url: ColumnType<string, string, string | undefined>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  is_online: ColumnType<boolean, boolean, boolean | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type ProxyRow = Selectable<ProxyTable>
export type InsertableProxyRow = Insertable<ProxyTable>
export type UpdateableProxyRow = Updateable<ProxyTable>
