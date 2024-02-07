import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('user_status')
    .asEnum(['blank', 'paid', 'hold'])
    .execute()

  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('tg_from_id', 'bigint', (col) => col.notNull())
    .addColumn('status', sql`user_status`, (col) => col.notNull())
    .addColumn('subscriptions', 'integer', (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn('create_time', 'timestamptz', (col) => col.notNull())
    .addColumn('update_time', 'timestamptz', (col) => col.notNull())
    .addColumn('process_time', 'timestamptz', (col) => col.notNull())
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
    .createIndex('user_create_time_key')
    .on('user')
    .column('create_time')
    .execute()

  await db.schema
    .createIndex('user_update_time_key')
    .on('user')
    .column('update_time')
    .execute()

  await db.schema
    .createIndex('user_process_time_key')
    .on('user')
    .column('process_time')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
  await db.schema.dropType('user_status').execute()
}
