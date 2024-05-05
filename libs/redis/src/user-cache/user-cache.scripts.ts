import { InitScripts } from '../redis.js'

const fetchUserCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
  'is_paid',
  'subscription_id',
  'subscriptions',
  'categories',
  'bots',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchTelegramUserId = `
return redis.call('GET', KEYS[1])
`

const fetchWebappUserId = `
return redis.call('GET', KEYS[1])
`

const fetchUsersIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveUserCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'tg_from_id', ARGV[2],
  'is_paid', ARGV[3],
  'subscription_id', ARGV[4],
  'subscriptions', ARGV[5],
  'categories', ARGV[6],
  'bots', ARGV[7],
  'created_at', ARGV[8],
  'updated_at', ARGV[9],
  'queued_at', ARGV[10]
)

return redis.status_reply('OK')
`

const appendUsersIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const saveTelegramUserId = `
redis.call('SET', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const saveWebappUserId = `
redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchUserCache', {
    numberOfKeys: 1,
    lua: fetchUserCache
  })

  redis.defineCommand('fetchTelegramUserId', {
    numberOfKeys: 1,
    lua: fetchTelegramUserId
  })

  redis.defineCommand('fetchWebappUserId', {
    numberOfKeys: 1,
    lua: fetchWebappUserId
  })

  redis.defineCommand('fetchUsersIndex', {
    numberOfKeys: 1,
    lua: fetchUsersIndex
  })

  redis.defineCommand('saveUserCache', {
    numberOfKeys: 1,
    lua: saveUserCache
  })

  redis.defineCommand('appendUsersIndex', {
    numberOfKeys: 1,
    lua: appendUsersIndex
  })

  redis.defineCommand('saveTelegramUserId', {
    numberOfKeys: 1,
    lua: saveTelegramUserId
  })

  redis.defineCommand('saveWebappUserId', {
    numberOfKeys: 1,
    lua: saveWebappUserId
  })
}

export default initScripts



/*
const renewUserCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'checkpoint_at', ARGV[1])
  redis.call('HSET', KEYS[1], 'time', ARGV[2])
end

return redis.status_reply('OK')
`
*/

//redis.defineCommand('dropUserCache', {
//  numberOfKeys: 2,
//  lua: dropUserCache
//})

//redis.defineCommand('renewUserCache', {
//  numberOfKeys: 1,
//  lua: renewUserCache
//})

