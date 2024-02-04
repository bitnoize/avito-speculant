import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { UserStatus } from '../user/user.js'

export interface UserLogTable {
  id: Generated<string>
  user_id: number
  time: ColumnType<Date, never, never>
  action: string
  status: UserStatus
  data: unknown
}

export type UserLogRow = Selectable<UserLogTable>
export type InsertableUserLogRow = Insertable<UserLogTable>
