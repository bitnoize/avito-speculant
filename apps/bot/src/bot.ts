import { LoggerConfig } from '@avito-speculant/logger'
import { DatabaseConfig, Plan } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig &
  DatabaseConfig &
  RedisConfig &
  QueueConfig & {
    BOT_TOKEN: string
  }

//
// User
//

export interface UserData {
  userId: number
  tgFromId: string
  activeSubscriptionId: number | null
  subscriptions: number
  categories: number
  bots: number
  createdAt: number
  updatedAt: number
}

export interface ApiGetUserReply {
  ok: boolean
  data: UserData
}

export interface ApiGetUser {
  Reply: ApiGetUserReply
}

//
// Plan
//

export interface PlanData {
  planId: number
  categoriesMax: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  priceRub: number
  isEnabled: boolean
}

export interface ApiGetPlanParams {
  planId: number
}

export interface ApiGetPlanReply {
  ok: boolean
  data: PlanData
}

export interface ApiGetPlan {
  Params: ApiGetPlanParams
  Reply: ApiGetPlanReply
}

export interface ApiGetPlansReply {
  ok: boolean
  data: PlanData[]
}

export interface ApiGetPlans {
  Reply: ApiGetPlansReply
}

//
// Subscription
//

export interface SubscriptionData {
  subscriptionId: number
  planId: number
  priceRub: number
  status: string
  createdAt: number
  updatedAt: number
  timeoutAt: number
  finishAt: number
}

export interface ApiGetSubscriptionParams {
  subscriptionId: number
}

export interface ApiGetSubscriptionReply {
  ok: boolean
  data: SubscriptionData
}

export interface ApiGetSubscription {
  Params: ApiGetSubscriptionParams
  Reply: ApiGetSubscriptionReply
}

export interface ApiPostSubscriptionBody {
  planId: number
}

export interface ApiPostSubscriptionReply {
  ok: boolean
  data: SubscriptionData
}

export interface ApiPostSubscription {
  Body: ApiPostSubscriptionBody
  Reply: ApiPostSubscriptionReply
}

export interface ApiPutSubscriptionCancelParams {
  subscriptionId: number
}

export interface ApiPutSubscriptionCancelReply {
  ok: boolean
  data: SubscriptionData
}

export interface ApiPutSubscriptionCancel {
  Params: ApiPutSubscriptionCancelParams
  Reply: ApiPutSubscriptionCancelReply
}

export interface ApiGetSubscriptionsReply {
  ok: boolean
  data: SubscriptionData[]
}

export interface ApiGetSubscriptions {
  Reply: ApiGetSubscriptionsReply
}

//
// Bot
//

export interface BotData {
  botId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  isOnline?: boolean
  tgFromId?: string | null
  username?: string | null
  totalCount?: number
  successCount?: number
  createdAt: number
  updatedAt: number
}

export interface ApiGetBotParams {
  botId: number
}

export interface ApiGetBotReply {
  ok: boolean
  data: BotData
}

export interface ApiGetBot {
  Params: ApiGetBotParams
  Reply: ApiGetBotReply
}

export interface ApiPostBotBody {
  token: string
}

export interface ApiPostBotReply {
  ok: boolean
  data: BotData
}

export interface ApiPostBot {
  Body: ApiPostBotBody
  Reply: ApiPostBotReply
}

export interface ApiPutBotEnableParams {
  botId: number
}

export interface ApiPutBotEnableReply {
  ok: boolean
  data: BotData
}

export interface ApiPutBotEnable {
  Params: ApiPutBotEnableParams
  Reply: ApiPutBotEnableReply
}

export interface ApiPutBotDisableParams {
  botId: number
}

export interface ApiPutBotDisableReply {
  ok: boolean
  data: BotData
}

export interface ApiPutBotDisable {
  Params: ApiPutBotDisableParams
  Reply: ApiPutBotDisableReply
}

export interface ApiGetBotsReply {
  ok: boolean
  data: BotData[]
}

export interface ApiGetBots {
  Reply: ApiGetBotsReply
}

//
// Category
//

export interface CategoryData {
  categoryId: number
  urlPath: string
  botId: number | null
  scraperId?: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  reportedAt?: number
}

export interface ApiGetCategoryParams {
  categoryId: number
}

export interface ApiGetCategoryReply {
  ok: boolean
  data: CategoryData
}

export interface ApiGetCategory {
  Params: ApiGetCategoryParams
  Reply: ApiGetCategoryReply
}

export interface ApiPostCategoryBody {
  urlPath: string
}

export interface ApiPostCategoryReply {
  ok: boolean
  data: CategoryData
}

export interface ApiPostCategory {
  Body: ApiPostCategoryBody
  Reply: ApiPostCategoryReply
}

export interface ApiPutCategoryEnableParams {
  categoryId: number
}

export interface ApiPutCategoryEnableBody {
  botId: number
}

export interface ApiPutCategoryEnableReply {
  ok: boolean
  data: CategoryData
}

export interface ApiPutCategoryEnable {
  Params: ApiPutCategoryEnableParams
  Body: ApiPutCategoryEnableBody
  Reply: ApiPutCategoryEnableReply
}

export interface ApiPutCategoryDisableParams {
  categoryId: number
  botId: number
}

export interface ApiPutCategoryDisableReply {
  ok: boolean
  data: CategoryData
}

export interface ApiPutCategoryDisable {
  Params: ApiPutCategoryDisableParams
  Reply: ApiPutCategoryDisableReply
}

export interface ApiGetCategoriesReply {
  ok: boolean
  data: CategoryData[]
}

export interface ApiGetCategories {
  Reply: ApiGetCategoriesReply
}

//
// Scraper
//

export interface ScraperData {
  scraperId: string
  urlPath: string
  totalCount: number
  successCount: number
}

export interface ApiGetScraperParams {
  scraperId: string
}

export interface ApiGetScraperReply {
  ok: boolean
  data: ScraperData
}

export interface ApiGetScraper {
  Params: ApiGetScraperParams
  Reply: ApiGetScraperReply
}
