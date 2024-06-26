import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('tg_from_id', 'varchar', (col) => col.notNull())
    .addColumn('active_subscription_id', 'integer')
    .addColumn('subscriptions', 'integer', (col) => col.notNull())
    .addColumn('categories', 'integer', (col) => col.notNull())
    .addColumn('bots', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('queued_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('user_tg_from_id_key')
    .on('user')
    .column('tg_from_id')
    .unique()
    .execute()

  await db.schema
    .createIndex('user_active_subscription_id_key')
    .on('user')
    .column('active_subscription_id')
    .unique()
    .execute()

  await db.schema.createIndex('user_created_at_key').on('user').column('created_at').execute()

  await db.schema.createIndex('user_queued_at_key').on('user').column('queued_at').execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
}
