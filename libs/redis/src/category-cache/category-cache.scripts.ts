import { InitScripts } from '../redis.js'

const fetchCategoryCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'scraper_id',
  'avito_url',
  'time'
)
`

const fetchCategories = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveCategoryCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'scraper_id', ARGV[3],
  'avito_url', ARGV[4],
  'time', ARGV[5]
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

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchCategoryCache', {
    numberOfKeys: 1,
    lua: fetchCategoryCache
  })

  redis.defineCommand('fetchCategories', {
    numberOfKeys: 1,
    lua: fetchCategories
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

export default initScripts
