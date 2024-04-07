import { InitScripts } from '../redis.js'

const fetchUserCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
  'checkpoint_at',
  'time'
)
`

const fetchUsers = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveUserCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'tg_from_id', ARGV[2],
  'checkpoint_at', ARGV[3],
  'time', ARGV[4]
)

redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const dropUserCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const renewUserCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'checkpoint_at', ARGV[1])
  redis.call('HSET', KEYS[1], 'time', ARGV[2])
end

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
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

  redis.defineCommand('renewUserCache', {
    numberOfKeys: 1,
    lua: renewUserCache
  })
}

export default initScripts
