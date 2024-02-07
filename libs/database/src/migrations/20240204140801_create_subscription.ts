import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('subscription_status')
    .asEnum(['wait', 'active', 'cancel', 'finish'])
    .execute()

  await db.schema
    .createTable('subscription')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('plan_id', 'integer', (col) => col.notNull().references('plan.id'))
    .addColumn('categories_max', 'integer', (col) => col.notNull())
    .addColumn('price_rub', 'integer', (col) => col.notNull())
    .addColumn('duration_days', 'integer', (col) => col.notNull())
    .addColumn('interval_sec', 'integer', (col) => col.notNull())
    .addColumn('analytics_on', 'boolean', (col) => col.notNull())
    .addColumn('status', sql`subscription_status`, (col) => col.notNull())
    .addColumn('create_time', 'timestamptz', (col) => col.notNull())
    .addColumn('update_time', 'timestamptz', (col) => col.notNull())
    .addColumn('process_time', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('subscription_user_id_key')
    .on('subscription')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('subscription_plan_id_key')
    .on('subscription')
    .column('plan_id')
    .execute()

  await db.schema
    .createIndex('subscription_status_key')
    .on('subscription')
    .column('status')
    .execute()

  await db.schema
    .createIndex('subscription_user_id_status_wait_key')
    .on('subscription')
    .columns(['user_id', 'status'])
    .where('status', '=', 'wait')
    .unique()
    .execute()

  await db.schema
    .createIndex('subscription_user_id_status_paid_key')
    .on('subscription')
    .columns(['user_id', 'status'])
    .where('status', '=', 'active')
    .unique()
    .execute()

  await db.schema
    .createIndex('subscription_create_time_key')
    .on('subscription')
    .column('create_time')
    .execute()

  await db.schema
    .createIndex('subscription_update_time_key')
    .on('subscription')
    .column('update_time')
    .execute()

  await db.schema
    .createIndex('subscription_process_time_key')
    .on('subscription')
    .column('process_time')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('subscription').execute()
  await db.schema.dropType('subscription_status').execute()
}
