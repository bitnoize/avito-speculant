import { InitScripts } from '../redis.js'

const fetchUserCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
  'active_subscription_id',
  'subscriptions',
  'categories',
  'bots',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchUserLink = `
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
  'active_subscription_id', ARGV[3],
  'subscriptions', ARGV[4],
  'categories', ARGV[5],
  'bots', ARGV[6],
  'created_at', ARGV[7],
  'updated_at', ARGV[8],
  'queued_at', ARGV[9]
)

return redis.status_reply('OK')
`

const saveUserLink = `
redis.call('SET', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const saveUserLinkTimeout = `
redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])

return redis.status_reply('OK')
`

const saveUsersIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropUserCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropUserLink = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropUsersIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchUserCache', {
    numberOfKeys: 1,
    lua: fetchUserCache
  })

  redis.defineCommand('fetchUserLink', {
    numberOfKeys: 1,
    lua: fetchUserLink
  })

  redis.defineCommand('fetchUsersIndex', {
    numberOfKeys: 1,
    lua: fetchUsersIndex
  })

  redis.defineCommand('saveUserCache', {
    numberOfKeys: 1,
    lua: saveUserCache
  })

  redis.defineCommand('saveUserLink', {
    numberOfKeys: 1,
    lua: saveUserLink
  })

  redis.defineCommand('saveUserLinkTimeout', {
    numberOfKeys: 1,
    lua: saveUserLinkTimeout
  })

  redis.defineCommand('saveUsersIndex', {
    numberOfKeys: 1,
    lua: saveUsersIndex
  })

  redis.defineCommand('dropUserCache', {
    numberOfKeys: 1,
    lua: dropUserCache
  })

  redis.defineCommand('dropUserLink', {
    numberOfKeys: 1,
    lua: dropUserLink
  })

  redis.defineCommand('dropUsersIndex', {
    numberOfKeys: 1,
    lua: dropUsersIndex
  })
}

export default initScripts
