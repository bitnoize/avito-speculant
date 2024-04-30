import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('category')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('url_path', 'varchar', (col) => col.notNull())
    .addColumn('bot_id', 'integer', (col) => col.references('bot.id'))
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('queued_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema.createIndex('category_user_id_key').on('category').column('user_id').execute()

  await db.schema
    .createIndex('category_user_id_url_path_key')
    .on('category')
    .columns(['user_id', 'url_path'])
    .unique()
    .execute()

  await db.schema
    .createIndex('category_bot_id_key')
    .on('category')
    .column('bot_id')
    .unique()
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

  await db.schema.createIndex('category_queued_at_key').on('category').column('queued_at').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('category').execute()
}
