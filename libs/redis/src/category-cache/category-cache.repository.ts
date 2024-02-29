import { Redis } from 'ioredis'
import { parseNumber, parseString } from '../redis.utils.js'

const categoriesScraperIdKey = (scraperId) =>
  ['cache', 'categories-scraper_id', scraperId].join(':')

const categoryIdKey = (categoryId) =>
  ['cache', 'category', categoryId].join(':')

export async function getIndexByScraperId(
  redis: Redis,
  scraperId: number
): Promise<number[]> {
  const indexRaw = await redis.getCategoriesIndexByScraperIdLua(
    categoriesScraperIdKey(scraperId) // KEYS[1]
  )

  if (!Array.isArray(indexRaw)) {
    throw new TypeError(`getCategoriesIndexByScraperIdLua malformed result`)
  }

  return indexRaw.map((raw) => parseNumber(raw))
}

export async function getList(
  redis: Redis,
  categoriesIndex: number[]
): Promise<CategoryCache[]> {
  if (categoriesIndex.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  categoriesIndex.forEach((categoryId) => {
    pipeline.getCategoryByIdLua(
      categoryIdKey(categoryId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  if (!Array.isArray(results)) {
    throw new TypeError(`pipeline malformed result`)
  }

  return results.map((result) => {
    if (!Array.isArray(result)) {
      throw new TypeError(`command malformed result`)
    }

    const categoryRaw = result[1]
    if (!Array.isArray(categoryRaw) && categoryRaw.length === 5) {
      throw new TypeError(`getCategoryByIdLua malformed result`)
    }

    return {
      jobId: parseNumber(scraperRaw[0]),
      avitoUrl: parseString(scraperJobRaw[1]),
    }
  })
}


