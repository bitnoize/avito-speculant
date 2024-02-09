import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('category')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('avito_url', 'varchar', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('scheduled_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('category_user_id_key')
    .on('category')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('category_is_enabled_key')
    .on('category')
    .column('is_enabled')
    .execute()

  await db.schema
    .createIndex('category_created_at_key')
    .on('category')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('category_updated_at_key')
    .on('category')
    .column('updated_at')
    .execute()

  await db.schema
    .createIndex('category_scheduled_at_key')
    .on('category')
    .column('scheduled_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('category').execute()
}
