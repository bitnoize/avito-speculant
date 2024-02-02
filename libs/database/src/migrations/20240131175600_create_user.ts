import { Kysely, sql } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('tg_from_id', 'bigint', (col) => col.notNull())
    .addColumn('first_name', 'varchar', (col) => col.notNull())
    .addColumn('last_name', 'varchar')
    .addColumn('username', 'varchar')
    .addColumn('language_code', 'varchar')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`NOW()`).notNull()
    )
    .execute()

  await db.schema
    .createIndex('user_tg_from_id_key')
    .on('user')
    .column('tg_from_id')
    .unique()
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute()
}
