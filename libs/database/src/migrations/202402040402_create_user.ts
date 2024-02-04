import { Kysely, sql } from 'kysely'
import { UserStatuses, UserDefaultStatus } from '../user/user.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('user_status').asEnum(UserStatuses).execute()

  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('tg_from_id', 'bigint', (col) => col.notNull())
    .addColumn('status', sql`user_status`, (col) =>
      col.notNull().defaultTo(UserDefaultStatus)
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute()

  await db.schema
    .createIndex('user_tg_from_id_key')
    .on('user')
    .column('tg_from_id')
    .unique()
    .execute()

  await db.schema
    .createIndex('user_status_key')
    .on('user')
    .column('status')
    .execute()

  await db.schema
    .createIndex('user_created_at_key')
    .on('user')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('user_updated_at_key')
    .on('user')
    .column('updated_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
  await db.schema.dropType('user_status').execute()
}
