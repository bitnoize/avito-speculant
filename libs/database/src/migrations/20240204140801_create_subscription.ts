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
    .addColumn('price_rub', 'integer', (col) => col.notNull())
    .addColumn('status', sql`subscription_status`, (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('queued_at', 'timestamptz', (col) => col.notNull())
    .addColumn('timeout_at', 'timestamptz', (col) => col.notNull())
    .addColumn('finish_at', 'timestamptz', (col) => col.notNull())
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
    .createIndex('subscription_user_id_status_active_key')
    .on('subscription')
    .columns(['user_id', 'status'])
    .where('status', '=', 'active')
    .unique()
    .execute()

  await db.schema
    .createIndex('subscription_created_at_key')
    .on('subscription')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('subscription_queued_at_key')
    .on('subscription')
    .column('queued_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('subscription').execute()
  await db.schema.dropType('subscription_status').execute()
}
