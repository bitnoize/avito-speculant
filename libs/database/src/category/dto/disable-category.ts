import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { User } from '../../user/user.js'
import { Bot } from '../../bot/bot.js'
import { DatabaseMethod } from '../../database.js'

export type DisableCategoryRequest = {
  userId: number
  categoryId: number
  data: CategoryLogData
}

export type DisableCategoryResponse = {
  user: User
  category: Category
  bot: Bot
  backLog: Notify[]
}

export type DisableCategory = DatabaseMethod<DisableCategoryRequest, DisableCategoryResponse>
