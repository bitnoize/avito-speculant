import { UserTable } from './user/user.table.js'

export type DatabaseConfig = {
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DATABASE: string
  POSTGRES_USERNAME?: string
  POSTGRES_PASSWORD?: string
}

/**
 * Database
 */
export interface Database {
  user: UserTable
}
