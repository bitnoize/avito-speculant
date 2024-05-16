import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchCategoryCache(
      categoryCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchCategoriesIndex(
      categoriesIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoryCache(
      categoryCacheKey: string, // KEYS[1]
      categoryId: number, // ARGV[1]
      userId: number, // ARGV[2]
      urlPath: string, // ARGV[3]
      scraperId: string, // ARGV[4]
      createdAt: number, // ARGV[5]
      updatedAt: number, // ARGV[6]
      queuedAt: number, // ARGV[7]
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoryEnabledCache(
      categoryCacheKey: string, // KEYS[1]
      botId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoryDisabledCache(
      categoryCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveProvisoCategoryCache(
      categoryCacheKey: string, // KEYS[1]
      reportedAt: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoriesIndex(
      categoriesIndexKey: string, // KEYS[1]
      categoryId: number, // ARGV[1]
      createdAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropCategoryCache(
      categoryCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropCategoriesIndex(
      categoriesIndexKey: string, // KEYS[1]
      categoryId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
