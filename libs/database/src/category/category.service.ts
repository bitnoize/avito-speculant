import {
  Notify,
  Category,
  UserNotFoundError,
  UserBlockedError,
  UserNotPaidError,
  SubscriptionNotActiveError,
  CategoryNotFoundError,
  CategoryIsEnabledError,
  CategoriesLimitExceedError
} from '@avito-speculant/domain'
import {
  CreateCategoryRequest,
  CreateCategoryResponse
} from './dto/create-category.js'
import {
  UpdateCategoryRequest,
  UpdateCategoryResponse
} from './dto/update-category.js'
import {
  EnableDisableCategoryRequest,
  EnableDisableCategoryResponse
} from './dto/enable-disable-category.js'
import {
  ListCategoriesRequest,
  ListCategoriesResponse
} from './dto/list-categories.js'
import {
  ScheduleCategoriesRequest,
  ScheduleCategoriesResponse
} from './dto/schedule-categories.js'
import * as userRepository from '../user/user.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { KyselyDatabase, TransactionDatabase } from '../database.js'

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
      message: `Category successfully created`,
      statusCode: 201,
      category: categoryRepository.buildModel(insertedCategoryRow),
      backLog
    }
  })
}

/**
 * Update Category
 */
export async function updateCategory(
  db: KyselyDatabase,
  request: UpdateCategoryRequest
): Promise<UpdateCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<UpdateCategoryRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<UpdateCategoryRequest>(request)
    }

    const selectedCategoryRow =
      await categoryRepository.selectRowByIdUserIdForUpdate(
        trx,
        request.categoryId,
        request.userId
      )

    if (selectedCategoryRow === undefined) {
      throw new CategoryNotFoundError<UpdateCategoryRequest>(request)
    }

    if (selectedCategoryRow.is_enabled) {
      throw new CategoryIsEnabledError<UpdateCategoryRequest>(request)
    }

    if (!(request.avitoUrl != null)) {
      return {
        message: `Category no updates specified`,
        statusCode: 200,
        category: categoryRepository.buildModel(selectedCategoryRow),
        backLog
      }
    }

    const updatedCategoryRow = await categoryRepository.updateRow(
      trx,
      selectedCategoryRow.id,
      request.avitoUrl
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      updatedCategoryRow.id,
      'update_category',
      updatedCategoryRow.avito_url,
      updatedCategoryRow.is_enabled,
      request.data
    )

    backLog.push(categoryLogRepository.buildNotify(categoryLogRow))

    return {
      message: `Category successfully updated`,
      statusCode: 201,
      category: categoryRepository.buildModel(updatedCategoryRow),
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

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<EnableDisableCategoryRequest>(request)
    }

    if (userRow.status !== 'paid') {
      throw new UserNotPaidError<EnableDisableCategoryRequest>(request)
    }

    const subscriptionRow =
      await subscriptionRepository.selectRowByUserIdStatusForShare(
        trx,
        userRow.id,
        'active'
      )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotActiveError<EnableDisableCategoryRequest>(request)
    }

    const { categories } = await categoryRepository.selectCountByUserId(
      trx,
      userRow.id
    )

    if (categories >= subscriptionRow.categories_max) {
      throw new CategoriesLimitExceedError<EnableDisableCategoryRequest>(request)
    }

    const selectedCategoryRow =
      await categoryRepository.selectRowByIdUserIdForUpdate(
        trx,
        request.categoryId,
        request.userId
      )

    if (selectedCategoryRow === undefined) {
      throw new CategoryNotFoundError<EnableDisableCategoryRequest>(request)
    }

    if (selectedCategoryRow.is_enabled) {
      return {
        message: `Category allready enabled`,
        statusCode: 200,
        category: categoryRepository.buildModel(selectedCategoryRow),
        backLog
      }
    }

    const updatedCategoryRow = await categoryRepository.updateRowIsEnabled(
      trx,
      selectedCategoryRow.id,
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
      message: `Category successfully enabled`,
      statusCode: 201,
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

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<EnableDisableCategoryRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<EnableDisableCategoryRequest>(request)
    }

    const selectedCategoryRow =
      await categoryRepository.selectRowByIdUserIdForUpdate(
        trx,
        request.categoryId,
        request.userId
      )

    if (selectedCategoryRow === undefined) {
      throw new CategoryNotFoundError<EnableDisableCategoryRequest>(request)
    }

    if (!selectedCategoryRow.is_enabled) {
      return {
        message: `Category allready disabled`,
        statusCode: 200,
        category: categoryRepository.buildModel(selectedCategoryRow),
        backLog
      }
    }

    const updatedCategoryRow = await categoryRepository.updateRowIsEnabled(
      trx,
      selectedCategoryRow.id,
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
      message: `Category successfully enabled`,
      statusCode: 201,
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

    const categoryRows = await categoryRepository.selectRowsList(
      trx,
      request.userId,
      request.all
    )

    return {
      message: `Categories successfully listed`,
      statusCode: 200,
      categories: categoryRepository.buildCollection(categoryRows),
      all: request.all
    }
  })
}

/**
 * Schedule Categories
 */
export async function scheduleCategories(
  trx: TransactionDatabase,
  request: ScheduleCategoriesRequest
): Promise<ScheduleCategoriesResponse> {
  const categories: Category[] = []
  const backLog: Notify[] = []

  const selectedCategoryRows =
    await categoryRepository.selectRowsSkipLockedForUpdate(trx, request.limit)

  if (selectedCategoryRows.length === 0) {
    return {
      message: `No categories pending to schedule`,
      statusCode: 200,
      categories,
      backLog
    }
  }

  for (const categoryRow of selectedCategoryRows) {
    let isChanged = false

    if (categoryRow.is_enabled) {
      // FIXME
    }

    if (isChanged) {
      const updatedCategoryRow = await categoryRepository.updateRowScheduleChange(
        trx,
        categoryRow.id,
        categoryRow.is_enabled
      )

      categories.push(categoryRepository.buildModel(updatedCategoryRow))

      const categoryLogRow = await categoryLogRepository.insertRow(
        trx,
        updatedCategoryRow.id,
        'schedule_category',
        updatedCategoryRow.avito_url,
        updatedCategoryRow.is_enabled,
        request.data
      )

      backLog.push(categoryLogRepository.buildNotify(categoryLogRow))
    } else {
      const updatedCategoryRow = await categoryRepository.updateRowSchedule(
        trx,
        categoryRow.id
      )

      categories.push(categoryRepository.buildModel(updatedCategoryRow))
    }
  }

  return {
    message: `Categories ready to schedule`,
    statusCode: 201,
    categories,
    backLog
  }
}
