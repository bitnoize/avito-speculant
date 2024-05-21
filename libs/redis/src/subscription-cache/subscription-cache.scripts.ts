import { InitScripts } from '../redis.js'

const fetchSubscriptionCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'plan_id',
  'price_rub',
  'status',
  'created_at',
  'updated_at',
  'queued_at',
  'timeout_at',
  'finish_at'
)
`

//const fetchSubscriptionLink = `
//return redis.call('GET', KEYS[1])
//`

const fetchSubscriptionsIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveSubscriptionCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'plan_id', ARGV[3],
  'price_rub', ARGV[4],
  'status', ARGV[5],
  'created_at', ARGV[6],
  'updated_at', ARGV[7],
  'queued_at', ARGV[8],
  'timeout_at', ARGV[9],
  'finish_at', ARGV[10]
)

return redis.status_reply('OK')
`

//const saveSubscriptionLink = `
//redis.call('SET', KEYS[1], ARGV[1])
//
//return redis.status_reply('OK')
//`

const saveSubscriptionsIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropSubscriptionCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

//const dropSubscriptionLink = `
//redis.call('DEL', KEYS[1])
//
//return redis.status_reply('OK')
//`

const dropSubscriptionsIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchSubscriptionCache', {
    numberOfKeys: 1,
    lua: fetchSubscriptionCache
  })

//redis.defineCommand('fetchSubscriptionLink', {
//  numberOfKeys: 1,
//  lua: fetchSubscriptionLink
//})

  redis.defineCommand('fetchSubscriptionsIndex', {
    numberOfKeys: 1,
    lua: fetchSubscriptionsIndex
  })

  redis.defineCommand('saveSubscriptionCache', {
    numberOfKeys: 1,
    lua: saveSubscriptionCache
  })

//redis.defineCommand('saveSubscriptionLink', {
//  numberOfKeys: 1,
//  lua: saveSubscriptionLink
//})

  redis.defineCommand('saveSubscriptionsIndex', {
    numberOfKeys: 1,
    lua: saveSubscriptionsIndex
  })

  redis.defineCommand('dropSubscriptionCache', {
    numberOfKeys: 1,
    lua: dropSubscriptionCache
  })

//redis.defineCommand('dropSubscriptionLink', {
//  numberOfKeys: 1,
//  lua: dropSubscriptionLink
//})

  redis.defineCommand('dropSubscriptionsIndex', {
    numberOfKeys: 1,
    lua: dropSubscriptionsIndex
  })
}

export default initScripts
