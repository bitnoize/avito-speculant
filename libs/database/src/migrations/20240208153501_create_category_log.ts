import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('category_log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('category_id', 'integer', (col) => col.notNull().references('category.id'))
    .addColumn('action', 'varchar', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('category_log_category_id_key')
    .on('category_log')
    .column('category_id')
    .execute()

  await db.schema
    .createIndex('category_log_action_key')
    .on('category_log')
    .column('action')
    .execute()

  await db.schema
    .createIndex('category_log_created_at_key')
    .on('category_log')
    .column('created_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('category_log').execute()
}
