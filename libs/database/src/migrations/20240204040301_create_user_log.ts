import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_log')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('time', 'timestamptz', (col) => col.notNull())
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('status', sql`user_status`, (col) => col.notNull())
    .addColumn('subscriptions', 'integer', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('user_log_user_id_key')
    .on('user_log')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('user_log_time_key')
    .on('user_log')
    .column('time')
    .execute()

  await db.schema
    .createIndex('user_log_action_key')
    .on('user_log')
    .column('action')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_log').execute()
}
