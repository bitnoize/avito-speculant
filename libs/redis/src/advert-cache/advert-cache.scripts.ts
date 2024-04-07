import { InitScripts } from '../redis.js'

const fetchAdvertCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'title',
  'price_rub',
  'url',
  'age',
  'image_url',
  'time'
)
`

const fetchAdverts = `
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

redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const dropAdvertCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const pourCategoryAdvertsWait = `
local wait_adverts = redis.call('SDIFF', KEYS[1], KEYS[2], KEYS[3], KEYS[4])

if #wait_adverts > 0 then
  redis.call('SADD', KEYS[2], unpack(wait_adverts))
fi

return redis.status_reply('OK')
`

const pourCategoryAdvertsSend = `
local count = tonumber(ARGV[1]) - tonumber(redis.call('SCARD', KEYS[2]))

if count > 0 then
  --
  local send_adverts = redis.call('SRANDMEMBER', KEYS[1], count)

  if #send_adverts > 0 then
    redis.call('SREM', KEYS[1], unpack(send_adverts))
    redis.call('SADD', KEYS[2], unpack(send_adverts))
  end
end

return redis.status_reply('OK')
`

const pourCategoryAdvertDone = `
redis.call('SREM', KEYS[1], ARGV[1])
redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchAdvertCache', {
    numberOfKeys: 1,
    lua: fetchAdvertCache
  })

  redis.defineCommand('fetchAdverts', {
    numberOfKeys: 1,
    lua: fetchAdverts
  })

  redis.defineCommand('saveAdvertCache', {
    numberOfKeys: 2,
    lua: saveAdvertCache
  })

  redis.defineCommand('dropAdvertCache', {
    numberOfKeys: 2,
    lua: dropAdvertCache
  })

  redis.defineCommand('pourCategoryAdvertsWait', {
    numberOfKeys: 4,
    lua: pourCategoryAdvertsWait
  })

  redis.defineCommand('pourCategoryAdvertsSend', {
    numberOfKeys: 2,
    lua: pourCategoryAdvertsSend
  })

  redis.defineCommand('pourCategoryAdvertDone', {
    numberOfKeys: 2,
    lua: pourCategoryAdvertDone
  })
}

export default initScripts
