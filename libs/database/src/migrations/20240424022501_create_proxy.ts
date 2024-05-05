import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('proxy')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('proxy_url', 'varchar', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('queued_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('proxy_proxy_url_key')
    .on('proxy')
    .column('proxy_url')
    .unique()
    .execute()

  await db.schema.createIndex('proxy_is_enabled_key').on('proxy').column('is_enabled').execute()

  await db.schema.createIndex('proxy_created_at_key').on('proxy').column('created_at').execute()

  await db.schema.createIndex('proxy_queued_at_key').on('proxy').column('queued_at').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('proxy').execute()
}
