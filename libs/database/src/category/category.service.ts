import { Notify } from '@avito-speculant/common'
import {
  CreateCategory,
  EnableCategory,
  DisableCategory,
  ListCategories,
  ProduceCategories,
  ConsumeCategory,
} from './dto/index.js'
import { Category } from './category.js'
import { CategoryNotFoundError, CategoriesLimitExceedError } from './category.errors.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { UserNotFoundError, UserNotPaidError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { SubscriptionNotActiveError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'

/**
 * Create Category
 */
export const createCategory: CreateCategory = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    // ...

    const insertedCategoryRow = await categoryRepository.insertRow(
      trx,
      userRow.id,
      request.avitoUrl
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      insertedCategoryRow.id,
      'create_category',
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
export const enableCategory: EnableCategory = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    if (categoryRow.is_enabled) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    if (!userRow.is_paid) {
      throw new UserNotPaidError({ request })
    }

    const subscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'active'
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotActiveError({ request })
    }

    const { categories } = await categoryRepository.selectCountByUserId(trx, categoryRow.user_id)

    if (categories >= subscriptionRow.categories_max) {
      throw new CategoriesLimitExceedError({ request })
    }

    // ...

    const updatedCategoryRow = await categoryRepository.updateRowIsEnabled(
      trx,
      categoryRow.id,
      true
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'enable_category',
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
export const disableCategory: DisableCategory = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    if (!categoryRow.is_enabled) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    // ...

    const updatedCategoryRow = await categoryRepository.updateRowIsEnabled(
      trx,
      categoryRow.id,
      false
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'disable_category',
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
export const listCategories: ListCategories = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    // ...

    const categoryRows = await categoryRepository.selectRowsList(
      trx,
      userRow.id,
      request.all ?? false
    )

    return {
      categories: categoryRepository.buildCollection(categoryRows)
    }
  })
}

/**
 * Produce Categories
 */
export const produceCategories: ProduceCategories = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const categories: Category[] = []

    const categoryRows = await categoryRepository.selectRowsProduce(trx, request.limit)

    for (const categoryRow of categoryRows) {
      const updatedCategoryRow = await categoryRepository.updateRowProduce(trx, categoryRow.id)

      categories.push(categoryRepository.buildModel(updatedCategoryRow))
    }

    return { categories }
  })
}

/**
 * Consume Category
 */
export const consumeCategory: ConsumeCategory = async function(db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    const subscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'active'
    )

    if (categoryRow.is_enabled) {
      if (subscriptionRow === undefined) {
        isChanged = true

        categoryRow.is_enabled = false
      }

      // ...
    }

    if (isChanged) {
      const updatedCategoryRow = await categoryRepository.updateRowConsume(
        trx,
        categoryRow.id,
        categoryRow.is_enabled
      )

      const categoryLogRow = await categoryLogRepository.insertRow(
        trx,
        updatedCategoryRow.id,
        'consume_category',
        updatedCategoryRow.is_enabled,
        request.data
      )

      backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

      return {
        category: categoryRepository.buildModel(updatedCategoryRow),
        subscription:
          subscriptionRow !== undefined
            ? subscriptionRepository.buildModel(subscriptionRow)
            : undefined,
        backLog
      }
    }

    return {
      category: categoryRepository.buildModel(categoryRow),
      subscription:
        subscriptionRow !== undefined
          ? subscriptionRepository.buildModel(subscriptionRow)
          : undefined,
      backLog
    }
  })
}
