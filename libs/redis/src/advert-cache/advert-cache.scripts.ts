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
  'price_rub',
  'url',
  'age',
  'image_url',
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
  'time', ARGV[7]
)

if not redis.call('LPOS', KEYS[2], ARGV[1]) then
  redis.call('LPUSH', KEYS[2], ARGV[1])
end

return redis.status_reply('OK')
`

const dropAdvertCache = `
redis.call('DEL', KEYS[1])

redis.call('LREM', KEYS[2], 0, ARGV[1])

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
    numberOfKeys: 2,
    lua: saveAdvertCache
  })

  redis.defineCommand('dropAdvertCache', {
    numberOfKeys: 2,
    lua: dropAdvertCache
  })
}
