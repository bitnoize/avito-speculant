import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { User } from '../../user/user.js'
import { Plan } from '../../plan/plan.js'
import { Subscription } from '../../subscription/subscription.js'
import { Bot } from '../../bot/bot.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeCategoryRequest = {
  categoryId: number
  data: CategoryLogData
}

export type ConsumeCategoryResponse = {
  category: Category
  user: User
  subscription: Subscription | undefined
  plan: Plan | undefined
  bot: Bot | undefined
  backLog: Notify[]
}

export type ConsumeCategory = DatabaseMethod<ConsumeCategoryRequest, ConsumeCategoryResponse>
