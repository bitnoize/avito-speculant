import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('subscription_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('subscription_id', 'integer', (col) => col.notNull().references('subscription.id'))
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('status', sql`subscription_status`, (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('subscription_log_subscription_id_key')
    .on('subscription_log')
    .column('subscription_id')
    .execute()

  await db.schema
    .createIndex('subscription_log_created_at_key')
    .on('subscription_log')
    .column('created_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('subscription_log').execute()
}
