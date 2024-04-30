import { Notify } from '@avito-speculant/common'
import {
  CreateCategory,
  EnableCategory,
  DisableCategory,
  ListCategories,
  ProduceCategories,
  ConsumeCategory
} from './dto/index.js'
import {
  CategoryNotFoundError,
  CategoryExistsError,
  CategoryBotLooseError,
  CategoryBotWasteError,
  CategoriesLimitExceedError
} from './category.errors.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { User } from '../user/user.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { Plan } from '../plan/plan.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'
import { Subscription } from '../subscription/subscription.js'
import { SubscriptionNotFoundError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { Bot } from '../bot/bot.js'
import { BotNotFoundError, BotIsLinkedError } from '../bot/bot.errors.js'
import * as botRepository from '../bot/bot.repository.js'

/**
 * Create Category
 */
export const createCategory: CreateCategory = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const existsCategoryRow = await categoryRepository.selectRowByUserIdUrlPath(
      trx,
      userRow.id,
      request.urlPath
    )

    if (existsCategoryRow !== undefined) {
      throw new CategoryExistsError({ request })
    }

    const insertedCategoryRow = await categoryRepository.insertRow(trx, userRow.id, request.urlPath)

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      insertedCategoryRow.id,
      'create_category',
      insertedCategoryRow.bot_id,
      insertedCategoryRow.is_enabled,
      request.data
    )

    backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

    return {
      category: categoryRepository.buildModel(insertedCategoryRow),
      backLog
    }
  })
}

/**
 * Enable Category
 */
export const enableCategory: EnableCategory = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const categoryRow = await categoryRepository.selectRowByIdUserId(
      trx,
      request.categoryId,
      userRow.id,
      true
    )

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    if (categoryRow.is_enabled) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    const botRow = await botRepository.selectRowById(trx, request.botId)

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    const linkedCategoryRow = await categoryRepository.selectRowByBotId(trx, botRow.id)

    if (linkedCategoryRow !== undefined) {
      throw new BotIsLinkedError({ request })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    const planRow = await planRepository.selectRowById(trx, activeSubscriptionRow.plan_id)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request }, 100)
    }

    userRow.categories = await categoryRepository.selectCountByUserId(trx, userRow.id)

    if (userRow.categories >= planRow.categories_max) {
      throw new CategoriesLimitExceedError({ request })
    }

    categoryRow.bot_id = botRow.id
    categoryRow.is_enabled = true

    const updatedCategoryRow = await categoryRepository.updateRowState(
      trx,
      categoryRow.id,
      categoryRow.bot_id,
      categoryRow.is_enabled
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'enable_category',
      updatedCategoryRow.bot_id,
      updatedCategoryRow.is_enabled,
      request.data
    )

    backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

    return {
      category: categoryRepository.buildModel(updatedCategoryRow),
      backLog
    }
  })
}

/**
 * Disable Category
 */
export const disableCategory: DisableCategory = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const categoryRow = await categoryRepository.selectRowByIdUserId(
      trx,
      request.categoryId,
      userRow.id,
      true
    )

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    if (!categoryRow.is_enabled) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    categoryRow.bot_id = null
    categoryRow.is_enabled = false

    const updatedCategoryRow = await categoryRepository.updateRowState(
      trx,
      categoryRow.id,
      categoryRow.bot_id,
      categoryRow.is_enabled
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'disable_category',
      updatedCategoryRow.bot_id,
      updatedCategoryRow.is_enabled,
      request.data
    )

    backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

    return {
      category: categoryRepository.buildModel(updatedCategoryRow),
      backLog
    }
  })
}

/**
 * List Categories
 */
export const listCategories: ListCategories = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const categoryRows = await categoryRepository.selectRowsByUserId(trx, userRow.id)

    return {
      categories: categoryRepository.buildCollection(categoryRows)
    }
  })
}

/**
 * Produce Categories
 */
export const produceCategories: ProduceCategories = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const categoryRows = await categoryRepository.selectRowsProduce(trx, request.limit)

    const updatedCategoryRows = await categoryRepository.updateRowsProduce(
      trx,
      categoryRows.map((categoryRow) => categoryRow.id)
    )

    return {
      categories: categoryRepository.buildCollection(updatedCategoryRows)
    }
  })
}

/**
 * Consume Category
 */
export const consumeCategory: ConsumeCategory = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    let subscription: Subscription | undefined = undefined
    let plan: Plan | undefined = undefined
    let bot: Bot | undefined = undefined

    const backLog: Notify[] = []

    let modified = false

    const categoryRow = await categoryRepository.selectRowById(trx, request.categoryId, true)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowById(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      subscription = subscriptionRepository.buildModel(activeSubscriptionRow)

      const planRow = await planRepository.selectRowById(
        trx,
        activeSubscriptionRow.plan_id
      )

      if (planRow === undefined) {
        throw new PlanNotFoundError({ request }, 100)
      }

      plan = planRepository.buildModel(planRow)

      if (categoryRow.is_enabled) {
        if (categoryRow.bot_id === null) {
          throw new CategoryBotLooseError({ request })
        }

        userRow.categories = await categoryRepository.selectCountByUserId(trx, userRow.id)

        if (userRow.categories <= planRow.categories_max) {
          const botRow = await botRepository.selectRowById(
            trx,
            categoryRow.bot_id
          )

          if (botRow === undefined) {
            throw new BotNotFoundError({ request }, 100)
          }

          bot = botRepository.buildModel(botRow)
        } else {
          categoryRow.bot_id = null
          categoryRow.is_enabled = false

          modified = true
        }
      } else {
        if (categoryRow.bot_id !== null) {
          throw new CategoryBotWasteError({ request })
        }
      }
    } else {
      if (categoryRow.is_enabled) {
        if (categoryRow.bot_id === null) {
          throw new CategoryBotLooseError({ request })
        }

        categoryRow.bot_id = null
        categoryRow.is_enabled = false

        modified = true
      } else {
        if (categoryRow.bot_id !== null) {
          throw new CategoryBotWasteError({ request })
        }
      }
    }

    if (!modified) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        user: userRepository.buildModel(userRow),
        subscription,
        plan,
        bot,
        backLog
      }
    }

    const updatedCategoryRow = await categoryRepository.updateRowState(
      trx,
      categoryRow.id,
      categoryRow.bot_id,
      categoryRow.is_enabled,
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'consume_category',
      updatedCategoryRow.bot_id,
      updatedCategoryRow.is_enabled,
      request.data
    )

    backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

    return {
      category: categoryRepository.buildModel(updatedCategoryRow),
      user: userRepository.buildModel(userRow),
      subscription,
      plan,
      bot,
      backLog
    }
  })
}
