import { InitScripts } from '../redis.js'

const fetchAdvertCache = `
return redis.call(
  'HMGET', KEYS[1],
  'scraper_id',
  'advert_id',
  'title',
  'description',
  'category_name',
  'price_rub',
  'url',
  'age',
  'image_url',
  'posted_at'
)
`

const fetchAdvertsIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveAdvertCache = `
redis.call(
  'HSET', KEYS[1],
  'scraper_id', ARGV[1],
  'advert_id', ARGV[2],
  'title', ARGV[3],
  'description', ARGV[4],
  'category_name', ARGV[5],
  'price_rub', ARGV[6],
  'url', ARGV[7],
  'age', ARGV[8],
  'image_url', ARGV[9],
  'posted_at', ARGV[10]
)

return redis.status_reply('OK')
`

const saveAdvertsIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropAdvertCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropAdvertsIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchAdvertCache', {
    numberOfKeys: 1,
    lua: fetchAdvertCache
  })

  redis.defineCommand('fetchAdvertsIndex', {
    numberOfKeys: 1,
    lua: fetchAdvertsIndex
  })

  redis.defineCommand('saveAdvertCache', {
    numberOfKeys: 1,
    lua: saveAdvertCache
  })

  redis.defineCommand('saveAdvertsIndex', {
    numberOfKeys: 1,
    lua: saveAdvertsIndex
  })

  redis.defineCommand('dropAdvertCache', {
    numberOfKeys: 1,
    lua: dropAdvertCache
  })

  redis.defineCommand('dropAdvertsIndex', {
    numberOfKeys: 1,
    lua: dropAdvertsIndex
  })
}

export default initScripts
