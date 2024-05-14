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
  'created_at',
  'updated_at',
  'queued_at',
  'reported_at'
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
  'scraper_id', ARGV[5],
  'is_enabled', ARGV[6],
  'created_at', ARGV[7],
  'updated_at', ARGV[8],
  'queued_at', ARGV[9]
)
redis.call('HSETNX', KEYS[1], 'reported_at', 0)

return redis.status_reply('OK')
`

const saveProvisoCategoryCache = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HSET', KEYS[1], 'reported_at', ARGV[1])

return redis.status_reply('OK')
`

const saveCategoriesIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropCategoryCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropCategoriesIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

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

  redis.defineCommand('saveProvisoCategoryCache', {
    numberOfKeys: 1,
    lua: saveProvisoCategoryCache
  })

  redis.defineCommand('saveCategoriesIndex', {
    numberOfKeys: 1,
    lua: saveCategoriesIndex
  })

  redis.defineCommand('dropCategoryCache', {
    numberOfKeys: 1,
    lua: dropCategoryCache
  })

  redis.defineCommand('dropCategoriesIndex', {
    numberOfKeys: 1,
    lua: dropCategoriesIndex
  })
}

export default initScripts
