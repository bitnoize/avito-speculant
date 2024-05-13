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
      botId: number | null, // ARGV[4]
      scraperId: string, // ARGV[5]
      isEnabled: number, // ARGV[6]
      createdAt: number, // ARGV[7]
      updatedAt: number, // ARGV[8]
      queuedAt: number, // ARGV[9]
      callback?: Callback<string>
    ): Result<string, Context>

    saveCategoryFirstTime(
      categoryCacheKey: string, // KEYS[1]
      firstTime: number, // ARGV[1]
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
