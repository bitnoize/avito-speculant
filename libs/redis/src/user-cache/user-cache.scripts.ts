import { Redis } from 'ioredis'

//
// UserCache Lua scripts
//

const fetchUserCache = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local user_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
  'time'
)

return {
  unpack(user_cache)
}
`

const fetchUsers = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveUserCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'tg_from_id', ARGV[2],
  'time', ARGV[3]
)

redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const dropUserCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

export default (redis: Redis): void => {
  redis.defineCommand('fetchUserCache', {
    numberOfKeys: 1,
    lua: fetchUserCache
  })

  redis.defineCommand('fetchUsers', {
    numberOfKeys: 1,
    lua: fetchUsers
  })

  redis.defineCommand('saveUserCache', {
    numberOfKeys: 2,
    lua: saveUserCache
  })

  redis.defineCommand('dropUserCache', {
    numberOfKeys: 2,
    lua: dropUserCache
  })
}