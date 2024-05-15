import { InitScripts } from '../redis.js'

const fetchProxyCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'url',
  'is_enabled',
  'is_online',
  'total_count',
  'success_count',
  'created_at',
  'updated_at',
  'queued_at'
)
`

const fetchRandomProxyLink = `
return redis.call('ZRANDMEMBER', KEYS[1])
`

const fetchProxiesIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveProxyCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'url', ARGV[2],
  'is_enabled', ARGV[3],
  'created_at', ARGV[4],
  'updated_at', ARGV[5],
  'queued_at', ARGV[6]
)
redis.call('HSETNX', KEYS[1], 'is_online', 0)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)

return redis.status_reply('OK')
`

const saveProxiesIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const saveOnlineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HSET', KEYS[1], 'is_online', 1)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'success_count', 1)

return redis.status_reply('OK')
`

const saveOfflineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HSET', KEYS[1], 'is_online', 0)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)

return redis.status_reply('OK')
`

const dropProxyCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropProxiesIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchProxyCache', {
    numberOfKeys: 1,
    lua: fetchProxyCache
  })

  redis.defineCommand('fetchRandomProxyLink', {
    numberOfKeys: 1,
    lua: fetchRandomProxyLink
  })

  redis.defineCommand('fetchProxiesIndex', {
    numberOfKeys: 1,
    lua: fetchProxiesIndex
  })

  redis.defineCommand('saveProxyCache', {
    numberOfKeys: 1,
    lua: saveProxyCache
  })

  redis.defineCommand('saveProxiesIndex', {
    numberOfKeys: 1,
    lua: saveProxiesIndex
  })

  redis.defineCommand('saveOnlineProxyCache', {
    numberOfKeys: 1,
    lua: saveOnlineProxyCache
  })

  redis.defineCommand('saveOfflineProxyCache', {
    numberOfKeys: 1,
    lua: saveOfflineProxyCache
  })

  redis.defineCommand('dropProxyCache', {
    numberOfKeys: 1,
    lua: dropProxyCache
  })

  redis.defineCommand('dropProxiesIndex', {
    numberOfKeys: 1,
    lua: dropProxiesIndex
  })
}

export default initScripts
