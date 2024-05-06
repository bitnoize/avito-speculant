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

const fetchRandomProxy = `
return redis.call('ZRANDMEMBER', KEYS[1])
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

const renewOnlineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'is_online', 1)
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)
  redis.call('HINCRBY', KEYS[1], 'success_count', 1)

  redis.call('SADD', KEYS[2], ARGV[1])
end

return redis.status_reply('OK')
`

const renewOfflineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'is_online', 0)
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)

  redis.call('SREM', KEYS[2], ARGV[1])
end

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchProxyCache', {
    numberOfKeys: 1,
    lua: fetchProxyCache
  })

  redis.defineCommand('fetchProxies', {
    numberOfKeys: 1,
    lua: fetchProxies
  })

  redis.defineCommand('fetchRandomProxy', {
    numberOfKeys: 1,
    lua: fetchRandomProxy
  })

  redis.defineCommand('saveProxyCache', {
    numberOfKeys: 2,
    lua: saveProxyCache
  })

  redis.defineCommand('dropProxyCache', {
    numberOfKeys: 3,
    lua: dropProxyCache
  })

  redis.defineCommand('renewOnlineProxyCache', {
    numberOfKeys: 2,
    lua: renewOnlineProxyCache
  })

  redis.defineCommand('renewOfflineProxyCache', {
    numberOfKeys: 2,
    lua: renewOfflineProxyCache
  })
}

export default initScripts
