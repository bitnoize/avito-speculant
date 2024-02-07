import { Transaction } from 'kysely'
import { UserTable } from './user/user.table.js'
//import { PlanTable } from './plan/plan.table.js'
//import { PlanLogTable } from './plan-log/plan-log.table.js'
import { UserLogTable } from './user-log/user-log.table.js'
import { SubscriptionTable } from './subscription/subscription.table.js'
import { SubscriptionLogTable } from './subscription-log/subscription-log.table.js'

export type DatabaseConfig = {
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DATABASE: string
  POSTGRES_USERNAME?: string
  POSTGRES_PASSWORD?: string
}

export interface Database {
  //plan: PlanTable
  //plan_log: PlanLogTable
  user: UserTable
  user_log: UserLogTable
  subscription: SubscriptionTable
  subscription_log: SubscriptionLogTable
}
