import { Redis } from 'ioredis'
import { parseNumber, parseString } from '../redis.utils.js'

const scraperSetKey = () =>
  ['cache', 'scrapers'].join(':')

const scraperHashKey = (jobId: number) =>
  ['cache', 'scraper', jobId].join(':')

export const getScraperIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function getIndex(
  redis: Redis
): Promise<number[]> {
  const indexRaw = await redis.getScraperJobsLua(
    scraperJobsKey() // KEYS[1]
  )

  if (!Array.isArray(scraperJobsRaw)) {
    throw new TypeError(`getScraperJobsLua malformed result`)
  }

  return scraperJobsRaw.map((res) => parseNumber(res))
}

export async function getScrapers(
  redis: Redis,
  scraperJobs: number
): Promise<Scraper[]> {
  if (scraperJobs.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  scraperJobs.forEach((scraperJob) => {
    pipeline.getScraperJobLua(
      scraperJobKey(scraperJobId) // KEYS[1]
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

    const scraperRaw = result[1]
    if (!Array.isArray(scraperRaw) && scraperRaw.length === 3) {
      throw new TypeError(`getScraperJobLua malformed result`)
    }

    return {
      jobId: parseNumber(scraperRaw[0]),
      avitoUrl: parseString(scraperJobRaw[1]),
      intervalSec: parseNumber(scraperJobRaw[2])
    }
  })
}


/*
cache:scraper_jobs => ['1708878860597-0', '1708877958473-0']

cache:avito_url-scraper_job:www.avito.com/blablabla => 1708878860597-0

cache:scraper_job:1708878860597-0 =>
  id: 1708878860597-0
  avito_url: www.avito.com/blablabla
  interval_sec: 10

cache:scraper-categories:1708878860597-0 => [1, 2, 3, 4, 5]

cache:category:1 =>
  category_id: 1
  scraper_job: 1708878860597-0
 
*/

export const scraperJobAvitoUrlKey = (avitoUrl: string) =>
  ['cache', 'scraper_job-avito_url', avitoUrl].join(':')

export const getScraperJobByAvitoUrlLua = `
return redis.call('GET', KEYS[1])
`

export const storeScraperJobLua = `
redis.call('SADD', KEYS[1], ARGV[1])

redis.call(
  'HSET', KEYS[2],
  '', ARGV[2],
  '', ARGV[3]
)

redis.call('SET', KEYS[3])

return redis.status_reply('OK')
`

export const fetchScraperJobLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil
end

local user = redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
)

return {
  unpack(user)
}
`
