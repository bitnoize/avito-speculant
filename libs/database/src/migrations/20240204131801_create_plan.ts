import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('plan')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('categories_max', 'integer', (col) => col.notNull())
    .addColumn('price_rub', 'integer', (col) => col.notNull())
    .addColumn('duration_days', 'integer', (col) => col.notNull())
    .addColumn('interval_sec', 'integer', (col) => col.notNull())
    .addColumn('analytics_on', 'boolean', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('subscriptions', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('scheduled_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('plan_is_enabled_key')
    .on('plan')
    .column('is_enabled')
    .execute()

  await db.schema
    .createIndex('plan_created_at_key')
    .on('plan')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('plan_updated_at_key')
    .on('plan')
    .column('updated_at')
    .execute()

  await db.schema
    .createIndex('plan_scheduled_at_key')
    .on('plan')
    .column('scheduled_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('plan').execute()
}
