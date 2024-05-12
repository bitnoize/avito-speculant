import { InitScripts } from '../redis.js'

const fetchBotCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'token',
  'is_linked',
  'is_enabled',
  'is_online',
  'total_count',
  'success_count',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchBotsIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveBotCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'token', ARGV[3],
  'is_linked', ARGV[4],
  'is_enabled', ARGV[5],
  'created_at', ARGV[6],
  'updated_at', ARGV[7],
  'queued_at', ARGV[8]
)
redis.call('HSETNX', KEYS[1], 'is_online', 0)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)

return redis.status_reply('OK')
`

const saveBotsIndex = `
return redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])
`

const saveOnlineBotCache = `
if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HSET', KEYS[1], 'is_online', 1)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'success_count', 1)

return redis.status_reply('OK')
`

const saveOfflineBotCache = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HSET', KEYS[1], 'is_online', 0)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)

return redis.status_reply('OK')
`

const dropBotCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropBotsIndex = `
return redis.call('ZREM', KEYS[1], ARGV[1])
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchBotCache', {
    numberOfKeys: 1,
    lua: fetchBotCache
  })

  redis.defineCommand('fetchBotsIndex', {
    numberOfKeys: 1,
    lua: fetchBotsIndex
  })

  redis.defineCommand('saveBotCache', {
    numberOfKeys: 1,
    lua: saveBotCache
  })

  redis.defineCommand('saveBotsIndex', {
    numberOfKeys: 1,
    lua: saveBotsIndex
  })

  redis.defineCommand('saveOnlineBotCache', {
    numberOfKeys: 1,
    lua: saveOnlineBotCache
  })

  redis.defineCommand('saveOfflineBotCache', {
    numberOfKeys: 1,
    lua: saveOfflineBotCache
  })

  redis.defineCommand('dropBotCache', {
    numberOfKeys: 1,
    lua: dropBotCache
  })

  redis.defineCommand('dropBotsIndex', {
    numberOfKeys: 1,
    lua: dropBotsIndex
  })
}

export default initScripts
