import { Redis } from 'ioredis'

//
// AdvertCache scripts
//

const fetchAdvertCache = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local advert_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'title',
  'priceRub',
  'url',
  'age',
  'imageUrl',
  'topic',
  'time'
)

return {
  unpack(advert_cache)
}
`

const fetchScraperAdverts = `
return redis.call('LRANGE', KEYS[1], 0, -1)
`

const fetchCategoryAdverts = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveAdvertCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'title', ARGV[2],
  'price_rub', ARGV[3],
  'url', ARGV[4],
  'age', ARGV[5],
  'image_url', ARGV[6],
  'topic', ARGV[7],
  'time', ARGV[8]
)

if redis.call('LPOS', KEYS[2], ARGV[1]) == nil then
  redis.call('LPUSH', KEYS[2], ARGV[1])
end

redis.call('SADD', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const dropAdvertCache = `
redis.call('DEL', KEYS[1])

redis.call('LREM', KEYS[2], 0, ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

export default (redis: Redis): void => {
  redis.defineCommand('fetchAdvertCache', {
    numberOfKeys: 1,
    lua: fetchAdvertCache
  })

  redis.defineCommand('fetchScraperAdverts', {
    numberOfKeys: 1,
    lua: fetchScraperAdverts
  })

  redis.defineCommand('fetchCategoryAdverts', {
    numberOfKeys: 1,
    lua: fetchCategoryAdverts
  })

  redis.defineCommand('saveAdvertCache', {
    numberOfKeys: 3,
    lua: saveAdvertCache
  })

  redis.defineCommand('dropAdvertCache', {
    numberOfKeys: 3,
    lua: dropAdvertCache
  })
}
