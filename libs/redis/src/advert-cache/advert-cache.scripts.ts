import { InitScripts } from '../redis.js'

const fetchAdvertCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'title',
  'description',
  'category_name',
  'price_rub',
  'url',
  'age',
  'image_url',
  'posted_at',
  'time'
)
`

const fetchAdverts = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveAdvertCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'title', ARGV[2],
  'description', ARGV[3],
  'category_name', ARGV[4],
  'price_rub', ARGV[5],
  'url', ARGV[6],
  'age', ARGV[7],
  'image_url', ARGV[8],
  'posted_at', ARGV[9],
  'time', ARGV[10]
)

redis.call('ZADD', KEYS[2], ARGV[9], ARGV[1])

return redis.status_reply('OK')
`

const dropAdvertCache = `
redis.call('DEL', KEYS[1])

redis.call('ZREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const pourCategoryAdvertsSkip = `
redis.call('DEL', KEYS[2])

local done_adverts = redis.call(
  'ZDIFF', 3,
  KEYS[1],
  KEYS[3],
  KEYS[4],
  'WITHSCORES'
)

if #done_adverts > 0 then
  for i = 1, #done_adverts/2 do
    done_adverts[2*i-1], done_adverts[2*i] = done_adverts[2*i], done_adverts[2*i-1]
  end

  redis.call('ZADD', KEYS[4], unpack(done_adverts))
end

return redis.status_reply('OK')
`

const pourCategoryAdvertsWait = `
local wait_adverts = redis.call(
  'ZDIFF', 4,
  KEYS[1],
  KEYS[2],
  KEYS[3],
  KEYS[4],
  'WITHSCORES'
)

if #wait_adverts >= 2 then
  for i = 1, #wait_adverts/2 do
    wait_adverts[2*i-1], wait_adverts[2*i] = wait_adverts[2*i], wait_adverts[2*i-1]
  end

  redis.call('ZADD', KEYS[2], unpack(wait_adverts))
end

return redis.status_reply('OK')
`

const pourCategoryAdvertsSend = `
local count = tonumber(ARGV[1]) - tonumber(redis.call('ZCARD', KEYS[2]))

if count > 0 then
  local send_adverts = redis.call('ZPOPMIN', KEYS[1], count)
  if #send_adverts >= 2 then
    for i = 1, #send_adverts/2 do
      send_adverts[2*i-1], send_adverts[2*i] = send_adverts[2*i], send_adverts[2*i-1]
    end

    redis.call('ZADD', KEYS[2], unpack(send_adverts))
  end
end

return redis.status_reply('OK')
`

const pourCategoryAdvertDone = `
local score  = redis.call('ZSCORE', KEYS[1], ARGV[1])

if score ~= false then
  redis.call('ZREM', KEYS[1], ARGV[1])
  redis.call('ZADD', KEYS[2], score, ARGV[1])
end

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

  redis.defineCommand('pourCategoryAdvertsSkip', {
    numberOfKeys: 4,
    lua: pourCategoryAdvertsSkip
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
