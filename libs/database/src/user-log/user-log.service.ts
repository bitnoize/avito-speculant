import { Kysely } from 'kysely'
import { UserLog, ListUserLogsRequest } from './user-log.js'
import { UserLogRow } from './user-log.table.js'
import * as userLogRepository from './user-log.repository.js'
import { Database } from '../database.js'

export async function listUserLogs(
  db: Kysely<Database>,
  request: ListUserLogsRequest
): Promise<UserLog[]> {
  const userLogRows = await userLogRepository.selectByUserId(db, request.userId)

  return makeUserLogsFromRows(userLogRows)
}

const makeUserLogFromRow = (row: UserLogRow): UserLog => {
  const userLog: UserLog = {
    id: row.id,
    userId: row.user_id,
    time: row.time,
    action: row.action,
    status: row.status,
    data: row.data
  }

  return userLog
}

const makeUserLogsFromRows = (rows: UserLogRow[]): UserLog[] => {
  return rows.map((row) => makeUserLogFromRow(row))
}
