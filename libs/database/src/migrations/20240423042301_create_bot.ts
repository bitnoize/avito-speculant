import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bot')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('user_id', 'integer', (col) => col.notNull().references('user.id'))
    .addColumn('token', 'varchar', (col) => col.notNull())
    .addColumn('is_linked', 'boolean', (col) => col.notNull())
    .addColumn('is_enabled', 'boolean', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('queued_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema.createIndex('bot_user_id_key').on('bot').column('user_id').execute()

  await db.schema.createIndex('bot_token_key').on('bot').column('token').unique().execute()

  await db.schema.createIndex('bot_is_enabled_key').on('bot').column('is_enabled').execute()

  await db.schema.createIndex('bot_created_at_key').on('bot').column('created_at').execute()

  await db.schema.createIndex('bot_queued_at_key').on('bot').column('queued_at').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('bot').execute()
}
