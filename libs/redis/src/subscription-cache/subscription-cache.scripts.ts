import { InitScripts } from '../redis.js'

const fetchSubscriptionCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'plan_id',
  'categories_max',
  'price_rub',
  'duration_days',
  'interval_sec',
  'analytics_on',
  'time'
)
`

const fetchSubscriptions = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveSubscriptionCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'plan_id', ARGV[3],
  'categories_max', ARGV[4],
  'price_rub', ARGV[5],
  'duration_days', ARGV[6],
  'interval_sec', ARGV[7],
  'analytics_on', ARGV[8],
  'time', ARGV[9]
)

redis.call('SADD', KEYS[2], ARGV[1])

redis.call('SADD', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const dropSubscriptionCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchSubscriptionCache', {
    numberOfKeys: 1,
    lua: fetchSubscriptionCache
  })

  redis.defineCommand('fetchSubscriptions', {
    numberOfKeys: 1,
    lua: fetchSubscriptions
  })

  redis.defineCommand('saveSubscriptionCache', {
    numberOfKeys: 3,
    lua: saveSubscriptionCache
  })

  redis.defineCommand('dropSubscriptionCache', {
    numberOfKeys: 3,
    lua: dropSubscriptionCache
  })
}

export default initScripts
