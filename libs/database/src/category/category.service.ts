import { Notify } from '@avito-speculant/notify'
import {
  CreateCategoryRequest,
  CreateCategoryResponse,
  EnableDisableCategoryRequest,
  EnableDisableCategoryResponse,
  ListCategoriesRequest,
  ListCategoriesResponse,
  ProduceCategoriesRequest,
  ProduceCategoriesResponse,
  ConsumeCategoryRequest,
  ConsumeCategoryResponse
} from './dto/index.js'
import { DEFAULT_CATEGORY_LIST_ALL, DEFAULT_CATEGORY_PRODUCE_LIMIT, Category } from './category.js'
import { CategoryNotFoundError, CategoriesLimitExceedError } from './category.errors.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { UserNotFoundError, UserBlockedError, UserNotPaidError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { SubscriptionNotActiveError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { KyselyDatabase } from '../database.js'

/**
 * Create Category
 */
export async function createCategory(
  db: KyselyDatabase,
  request: CreateCategoryRequest
): Promise<CreateCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<CreateCategoryRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<CreateCategoryRequest>(request)
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
      insertedCategoryRow.avito_url,
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
export async function enableCategory(
  db: KyselyDatabase,
  request: EnableDisableCategoryRequest
): Promise<EnableDisableCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError<EnableDisableCategoryRequest>(request)
    }

    if (categoryRow.is_enabled) {
      return {
        category: categoryRepository.buildModel(categoryRow),
        backLog
      }
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError<EnableDisableCategoryRequest>(request, 500)
    }

    if (userRow.status !== 'paid') {
      throw new UserNotPaidError<EnableDisableCategoryRequest>(request)
    }

    const subscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'active'
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotActiveError<EnableDisableCategoryRequest>(request)
    }

    const { categories } = await categoryRepository.selectCountByUserId(trx, categoryRow.user_id)

    if (categories >= subscriptionRow.categories_max) {
      throw new CategoriesLimitExceedError<EnableDisableCategoryRequest>(request)
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
      updatedCategoryRow.avito_url,
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
export async function disableCategory(
  db: KyselyDatabase,
  request: EnableDisableCategoryRequest
): Promise<EnableDisableCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError<EnableDisableCategoryRequest>(request)
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
      updatedCategoryRow.avito_url,
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
export async function listCategories(
  db: KyselyDatabase,
  request: ListCategoriesRequest
): Promise<ListCategoriesResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<ListCategoriesRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<ListCategoriesRequest>(request)
    }

    // ...

    const categoryRows = await categoryRepository.selectRowsList(
      trx,
      userRow.id,
      request.all ?? DEFAULT_CATEGORY_LIST_ALL
    )

    return {
      categories: categoryRepository.buildCollection(categoryRows)
    }
  })
}

/**
 * Produce Categories
 */
export async function produceCategories(
  db: KyselyDatabase,
  request: ProduceCategoriesRequest
): Promise<ProduceCategoriesResponse> {
  return await db.transaction().execute(async (trx) => {
    const categories: Category[] = []

    const categoryRows = await categoryRepository.selectRowsSkipLockedForUpdate(
      trx,
      request.limit ?? DEFAULT_CATEGORY_PRODUCE_LIMIT
    )

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
export async function consumeCategory(
  db: KyselyDatabase,
  request: ConsumeCategoryRequest
): Promise<ConsumeCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const categoryRow = await categoryRepository.selectRowByIdForUpdate(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError<ConsumeCategoryRequest>(request)
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, categoryRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError<ConsumeCategoryRequest>(request, 500)
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
        updatedCategoryRow.avito_url,
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
