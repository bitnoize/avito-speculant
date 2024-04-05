import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchCategoryCache(categoryKey: string, callback?: Callback<string>): Result<string, Context>

    fetchCategories(categoriesKey: string, callback?: Callback<string>): Result<string, Context>

    saveCategoryCache(
      categoryKey: string,
      userCategoriesKey: string,
      scraperCategoriesKey: string,
      categoryId: number,
      userId: number,
      scraperId: string,
      avitoUrl: string,
      time: number,
      callback?: Callback<string>
    ): Result<string, Context>

    dropCategoryCache(
      categoryKey: string,
      userCategoriesKey: string,
      scraperCategoriesKey: string,
      categoryId: number,
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
