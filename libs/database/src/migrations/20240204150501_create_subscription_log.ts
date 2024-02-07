import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('subscription_log')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('subscription_id', 'integer', (col) =>
      col.notNull().references('subscription.id'))
    .addColumn('time', 'timestamptz', (col) => col.notNull())
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('categories_max', 'integer', (col) => col.notNull())
    .addColumn('price_rub', 'integer', (col) => col.notNull())
    .addColumn('duration_days', 'integer', (col) => col.notNull())
    .addColumn('interval_sec', 'integer', (col) => col.notNull())
    .addColumn('analytics_on', 'boolean', (col) => col.notNull())
    .addColumn('status', sql`subscription_status`, (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('subscription_log_subscription_id_key')
    .on('subscription_log')
    .column('subscription_id')
    .execute()

  await db.schema
    .createIndex('subscription_log_time_key')
    .on('subscription_log')
    .column('time')
    .execute()

  await db.schema
    .createIndex('subscription_log_action_key')
    .on('subscription_log')
    .column('action')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('subscription_log').execute()
}
