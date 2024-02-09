import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('user_status')
    .asEnum(['trial', 'paid', 'block'])
    .execute()

  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('tg_from_id', 'varchar', (col) => col.notNull())
    .addColumn('status', sql`user_status`, (col) => col.notNull())
    .addColumn('subscriptions', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull())
    .addColumn('scheduled_at', 'timestamptz', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('user_tg_from_id_key')
    .on('user')
    .column('tg_from_id')
    .unique()
    .execute()

  await db.schema
    .createIndex('user_status_key')
    .on('user')
    .column('status')
    .execute()

  await db.schema
    .createIndex('user_created_at_key')
    .on('user')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('user_updated_at_key')
    .on('user')
    .column('updated_at')
    .execute()

  await db.schema
    .createIndex('user_scheduled_at_key')
    .on('user')
    .column('scheduled_at')
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
  await db.schema.dropType('user_status').execute()
}
