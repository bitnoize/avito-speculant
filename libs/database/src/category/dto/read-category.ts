import { Category } from '../category.js'
import { Bot } from '../../bot/bot.js'
import { DatabaseMethod } from '../../database.js'

export type ReadCategoryRequest = {
  userId: number
  categoryId: number
}

export type ReadCategoryResponse = {
  category: Category
  bot: Bot | undefined
}

export type ReadCategory = DatabaseMethod<ReadCategoryRequest, ReadCategoryResponse>
