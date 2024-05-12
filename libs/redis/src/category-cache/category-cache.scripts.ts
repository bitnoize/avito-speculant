import { InitScripts } from '../redis.js'

const fetchCategoryCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'url_path',
  'bot_id',
  'scraper_id',
  'is_enabled',
  'first_time',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchCategoriesIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveCategoryCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'url_path', ARGV[3],
  'bot_id', ARGV[4],
  'is_enabled', ARGV[5],
  'created_at', ARGV[6],
  'updated_at', ARGV[7],
  'queued_at', ARGV[8]
)

redis.call('HSETNX', KEYS[1], 'first_time', 1)

return redis.status_reply('OK')
`

const saveCategoryScraperId = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  redis.call('HSET', KEYS[1], 'scraper_id', ARGV[1])
end

return redis.status_reply('OK')
`

const saveCategoryFirstTime = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  redis.call('HSET', KEYS[1], 'first_time', ARGV[1])
end

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchCategoryCache', {
    numberOfKeys: 1,
    lua: fetchCategoryCache
  })

  redis.defineCommand('fetchCategoriesIndex', {
    numberOfKeys: 1,
    lua: fetchCategoriesIndex
  })

  redis.defineCommand('saveCategoryCache', {
    numberOfKeys: 1,
    lua: saveCategoryCache
  })

  redis.defineCommand('dropCategoryCache', {
    numberOfKeys: 1,
    lua: dropCategoryCache
  })

  redis.defineCommand('resetCategoryCache', {
    numberOfKeys: 1,
    lua: resetCategoryCache
  })
}

export default initScripts
