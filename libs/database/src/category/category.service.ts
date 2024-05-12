import { Notify } from '@avito-speculant/common'
import {
  CreateCategory,
  EnableCategory,
  DisableCategory,
  ProduceCategories,
  ConsumeCategory
} from './dto/index.js'
import {
  CategoryNotFoundError,
  CategoryExistsError,
  CategoryBotLooseError,
  CategoryBotWasteError,
  CategoryIsEnabledError,
  CategoryIsDisabledError,
  CategoriesLimitExceedError
} from './category.errors.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'
import { SubscriptionNotFoundError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { BotNotFoundError, BotIsLinkedError, BotIsDisabledError } from '../bot/bot.errors.js'
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
      throw new CategoryExistsError({ request, existsCategoryRow })
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
      throw new CategoryIsEnabledError({ request, categoryRow })
    }

    if (categoryRow.bot_id !== null) {
      throw new CategoryBotWasteError({ request, categoryRow }, 100)
    }

    const botRow = await botRepository.selectRowById(trx, request.botId)

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    if (!botRow.is_enabled) {
      throw new BotIsDisabledError({ request, categoryRow })
    }

    const linkedCategoryRow = await categoryRepository.selectRowByBotId(trx, botRow.id)

    if (linkedCategoryRow !== undefined) {
      throw new BotIsLinkedError({ request, botRow, linkedCategoryRow })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request, userRow })
    }

    const planRow = await planRepository.selectRowById(trx, activeSubscriptionRow.plan_id)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request, activeSubscriptionRow }, 100)
    }

    userRow.categories = await categoryRepository.selectCountByUserId(trx, userRow.id)

    if (userRow.categories >= planRow.categories_max) {
      throw new CategoriesLimitExceedError({ request, userRow, planRow })
    }

    userRow.categories += 1

    categoryRow.bot_id = botRow.id
    categoryRow.is_enabled = true

    botRow.is_linked = true

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
      user: userRepository.buildModel(userRow),
      category: categoryRepository.buildModel(updatedCategoryRow),
      bot: botRepository.buildModel(botRow),
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
      throw new CategoryIsDisabledError({ request, categoryRow })
    }

    if (categoryRow.bot_id === null) {
      throw new CategoryBotWasteError({ request, categoryRow }, 100)
    }

    const botRow = await botRepository.selectRowById(trx, categoryRow.bot_id)

    if (botRow === undefined) {
      throw new BotNotFoundError({ request, categoryRow })
    }

    if (!botRow.is_enabled) {
      throw new BotIsDisabledError({ request, categoryRow })
    }

    userRow.categories -= 1

    categoryRow.bot_id = null
    categoryRow.is_enabled = false

    botRow.is_linked = false

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
      user: userRepository.buildModel(userRow),
      category: categoryRepository.buildModel(updatedCategoryRow),
      bot: botRepository.buildModel(botRow),
      backLog
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
    const backLog: Notify[] = []

    let modified = false

    const categoryRow = await categoryRepository.selectRowById(trx, request.entityId, true)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowById(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request, categoryRow }, 100)
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      const planRow = await planRepository.selectRowById(trx, activeSubscriptionRow.plan_id)

      if (planRow === undefined) {
        throw new PlanNotFoundError({ request, categoryRow, activeSubscriptionRow }, 100)
      }

      if (categoryRow.is_enabled) {
        if (categoryRow.bot_id === null) {
          throw new CategoryBotLooseError({ request, categoryRow })
        }

        const botRow = await botRepository.selectRowById(trx, categoryRow.bot_id)

        if (botRow === undefined) {
          throw new BotNotFoundError({ request, categoryRow }, 100)
        }

        if (!botRow.is_enabled) {
          throw new BotIsDisabledError({ request, categoryRow, botRow }, 100)
        }

        userRow.categories = await categoryRepository.selectCountByUserId(trx, userRow.id)

        if (userRow.categories > planRow.categories_max) {
          categoryRow.bot_id = null
          categoryRow.is_enabled = false

          modified = true
        }
      } else {
        if (categoryRow.bot_id !== null) {
          throw new CategoryBotWasteError({ request, categoryRow })
        }
      }
    } else {
      if (categoryRow.is_enabled) {
        if (categoryRow.bot_id === null) {
          throw new CategoryBotWasteError({ request, categoryRow })
        }

        categoryRow.bot_id = null
        categoryRow.is_enabled = false

        modified = true
      } else {
        if (categoryRow.bot_id !== null) {
          throw new CategoryBotWasteError({ request, categoryRow })
        }
      }
    }

    if (!modified) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    const updatedCategoryRow = await categoryRepository.updateRowState(
      trx,
      categoryRow.id,
      categoryRow.bot_id,
      categoryRow.is_enabled
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
      backLog
    }
  })
}
