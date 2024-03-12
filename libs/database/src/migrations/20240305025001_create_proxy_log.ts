import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('proxy_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('proxy_id', 'integer', (col) => col.notNull().references('proxy.id'))
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema.createIndex('proxy_log_proxy_id_key').on('proxy_log').column('proxy_id').execute()

  await db.schema.createIndex('proxy_log_action_key').on('proxy_log').column('action').execute()

  await db.schema
    .createIndex('proxy_log_created_at_key')
    .on('proxy_log')
    .column('created_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('proxy_log').execute()
}
