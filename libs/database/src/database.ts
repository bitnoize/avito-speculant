import { Kysely, Transaction } from 'kysely'
import { UserTable } from './user/user.table.js'
import { UserLogTable } from './user-log/user-log.table.js'
import { PlanTable } from './plan/plan.table.js'
import { PlanLogTable } from './plan-log/plan-log.table.js'
import { SubscriptionTable } from './subscription/subscription.table.js'
import { SubscriptionLogTable } from './subscription-log/subscription-log.table.js'
import { BotTable } from './bot/bot.table.js'
import { BotLogTable } from './bot-log/bot-log.table.js'
import { CategoryTable } from './category/category.table.js'
import { CategoryLogTable } from './category-log/category-log.table.js'
import { ProxyTable } from './proxy/proxy.table.js'
import { ProxyLogTable } from './proxy-log/proxy-log.table.js'

export type DatabaseConfig = {
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DATABASE: string
  POSTGRES_USERNAME: string
  POSTGRES_PASSWORD?: string
}

export interface Database {
  user: UserTable
  user_log: UserLogTable
  plan: PlanTable
  plan_log: PlanLogTable
  subscription: SubscriptionTable
  subscription_log: SubscriptionLogTable
  bot: BotTable
  bot_log: BotLogTable
  category: CategoryTable
  category_log: CategoryLogTable
  proxy: ProxyTable
  proxy_log: ProxyLogTable
}

export type KyselyDatabase = Kysely<Database>
export type TransactionDatabase = Transaction<Database>

export type DatabaseMethod<Request, Response> = (
  db: KyselyDatabase,
  request: Request
) => Promise<Response>
