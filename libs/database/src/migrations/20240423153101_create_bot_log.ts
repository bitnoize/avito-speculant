import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bot_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('bot_id', 'integer', (col) => col.notNull().references('bot.id'))
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('is_linked', 'boolean', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema.createIndex('bot_log_bot_id_key').on('bot_log').column('bot_id').execute()

  await db.schema.createIndex('bot_log_created_at_key').on('bot_log').column('created_at').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('bot_log').execute()
}
