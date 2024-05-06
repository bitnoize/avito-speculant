import { InitScripts } from '../redis.js'

const fetchPlanCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'categories_max',
  'duration_days',
  'interval_sec',
  'analytics_on',
  'price_rub',
  'is_enabled',
  'subscriptions',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchPlansIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const savePlanCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'categories_max', ARGV[2],
  'duration_days', ARGV[3],
  'interval_sec', ARGV[4],
  'analytics_on', ARGV[5],
  'price_rub', ARGV[6],
  'is_enabled', ARGV[7],
  'subscriptions', ARGV[8],
  'created_at', ARGV[9],
  'updated_at', ARGV[10],
  'queued_at', ARGV[11]
)

return redis.status_reply('OK')
`

const savePlansIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchPlanCache', {
    numberOfKeys: 1,
    lua: fetchPlanCache
  })

  redis.defineCommand('fetchPlansIndex', {
    numberOfKeys: 1,
    lua: fetchPlansIndex
  })

  redis.defineCommand('savePlanCache', {
    numberOfKeys: 1,
    lua: savePlanCache
  })

  redis.defineCommand('savePlansIndex', {
    numberOfKeys: 1,
    lua: savePlansIndex
  })
}

export default initScripts
