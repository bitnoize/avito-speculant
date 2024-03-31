import { Redis } from 'ioredis'

//
// ProxyCache scripts
//

const fetchProxyCache = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local proxy_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'proxy_url',
  'is_online',
  'total_count',
  'success_count',
  'size_bytes',
  'time'
)

return {
  unpack(proxy_cache)
}
`

const fetchProxies = `
return redis.call('SMEMBERS', KEYS[1])
`

const fetchRandomProxy = `
return redis.call('SRANDMEMBER', KEYS[1])
`

const saveProxyCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'proxy_url', ARGV[2],
  'time', ARGV[3]
)
redis.call('HSETNX', KEYS[1], 'is_online', 0)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('HSETNX', KEYS[1], 'size_bytes', 0)

redis.call('SADD', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

const dropProxyCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const renewOnlineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'is_online', 1)
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)
  redis.call('HINCRBY', KEYS[1], 'success_count', 1)
  redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[2])
  redis.call('HSET', KEYS[1], 'time', ARGV[3])

  redis.call('SADD', KEYS[2], ARGV[1])
end

return redis.status_reply('OK')
`

const renewOfflineProxyCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HSET', KEYS[1], 'is_online', 0)
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)
  redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[2])
  redis.call('HSET', KEYS[1], 'time', ARGV[3])

  redis.call('SREM', KEYS[2], ARGV[1])
end

return redis.status_reply('OK')
`

export default (redis: Redis): void => {
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
