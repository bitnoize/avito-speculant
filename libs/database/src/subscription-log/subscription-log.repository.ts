import { Kysely, Transaction } from 'kysely'
import {
  SubscriptionLogRow,
  InsertableSubscriptionLogRow
} from './subscription-log.table.js'
import { Database } from '../database.js'

export async function selectBySubscriptionId(
  db: Kysely<Database>,
  subscription_id: number,
  limit = 1000
): Promise<SubscriptionLogRow[]> {
  const subscriptionLogRows = await db
    .selectFrom('subscription_log')
    .selectAll()
    .where('subscription_id', '=', subscription_id)
    .orderBy('time', 'desc')
    .limit(limit)
    .execute()

  return subscriptionLogRows
}

export async function insert(
  trx: Transaction<Database>,
  insertableSubscriptionLogRow: InsertableSubscriptionLogRow
): Promise<void> {
  await trx
    .insertInto('subscription_log')
    .values(insertableSubscriptionLogRow)
    .returningAll()
    .executeTakeFirstOrThrow()
}
