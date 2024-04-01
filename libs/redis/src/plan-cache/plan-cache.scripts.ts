import { Redis } from 'ioredis'

//
// PlanCache Lua scripts
//

const fetchPlanCache = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local plan_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'categories_max',
  'price_rub',
  'duration_days',
  'interval_sec',
  'analytics_on',
  'time'
)

return {
  unpack(plan_cache)
}
`

const fetchPlans = `
return redis.call('SMEMBERS', KEYS[1])
`

const savePlanCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'categories_max', ARGV[2],
  'price_rub', ARGV[3],
  'duration_days', ARGV[4],
  'interval_sec', ARGV[5],
  'analytics_on', ARGV[6],
  'time', ARGV[7]
)

redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const dropPlanCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

export default (redis: Redis): void => {
  redis.defineCommand('fetchPlanCache', {
    numberOfKeys: 1,
    lua: fetchPlanCache
  })

  redis.defineCommand('fetchPlans', {
    numberOfKeys: 1,
    lua: fetchPlans
  })

  redis.defineCommand('savePlanCache', {
    numberOfKeys: 2,
    lua: savePlanCache
  })

  redis.defineCommand('dropPlanCache', {
    numberOfKeys: 2,
    lua: dropPlanCache
  })
}