import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('is_paid', 'boolean', (col) => col.notNull())
    .addColumn('subscriptions', 'integer', (col) => col.notNull())
    .addColumn('categories', 'integer', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema.createIndex('user_log_user_id_key').on('user_log').column('user_id').execute()

  await db.schema.createIndex('user_log_action_key').on('user_log').column('action').execute()

  await db.schema
    .createIndex('user_log_created_at_key')
    .on('user_log')
    .column('created_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_log').execute()
}
