import { Redis } from 'ioredis'

//
// CategoryCache scripts
//

const fetchCategoryCache = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local category_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'scraper_id',
  'avito_url',
  'time'
)

return {
  unpack(category_cache)
}
`

const fetchUserCategories = `
return redis.call('SMEMBERS', KEYS[1])
`

const fetchScraperCategories = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveCategoryCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'scraper_id', ARGV[3],
  'avito_url', ARGV[4]
)

redis.call('SADD', KEYS[2], ARGV[1])

redis.call('SADD', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const dropCategoryCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

export default (redis: Redis): void => {
  redis.defineCommand('fetchCategoryCache', {
    numberOfKeys: 1,
    lua: fetchCategoryCache
  })

  redis.defineCommand('fetchUserCategories', {
    numberOfKeys: 1,
    lua: fetchUserCategories
  })

  redis.defineCommand('fetchScraperCategories', {
    numberOfKeys: 1,
    lua: fetchScraperCategories
  })

  redis.defineCommand('saveCategoryCache', {
    numberOfKeys: 3,
    lua: saveCategoryCache
  })

  redis.defineCommand('dropCategoryCache', {
    numberOfKeys: 3,
    lua: dropCategoryCache
  })
}
