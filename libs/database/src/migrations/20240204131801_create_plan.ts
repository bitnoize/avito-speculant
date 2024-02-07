import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('plan')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('sort_order', 'integer', (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn('categories_max', 'integer', (col) => col.notNull())
    .addColumn('price_rub', 'integer', (col) => col.notNull())
    .addColumn('duration_days', 'integer', (col) => col.notNull())
    .addColumn('interval_sec', 'integer', (col) => col.notNull())
    .addColumn('analytics_on', 'boolean', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn('subscriptions', 'integer', (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn('create_time', 'timestamptz', (col) => col.notNull())
    .addColumn('update_time', 'timestamptz', (col) => col.notNull())
    .addColumn('process_time', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('plan_sort_order_key')
    .on('plan')
    .column('sort_order')
    .execute()

  await db.schema
    .createIndex('plan_is_active_key')
    .on('plan')
    .column('is_active')
    .execute()

  await db.schema
    .createIndex('plan_create_time_key')
    .on('plan')
    .column('create_time')
    .execute()

  await db.schema
    .createIndex('plan_update_time_key')
    .on('plan')
    .column('update_time')
    .execute()

  await db.schema
    .createIndex('plan_process_time_key')
    .on('plan')
    .column('process_time')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('plan').execute()
}
