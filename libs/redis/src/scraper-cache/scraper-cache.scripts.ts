import { InitScripts } from '../redis.js'

const fetchScraperCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'avito_url',
  'interval_sec',
  'total_count',
  'success_count',
  'size_bytes',
  'time'
)
`

const fetchScrapers = `
return redis.call('SMEMBERS', KEYS[1])
`

const saveScraperCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'avito_url', ARGV[2],
  'interval_sec', ARGV[3],
  'time', ARGV[4]
)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('HSETNX', KEYS[1], 'size_bytes', 0)

redis.call('SADD', KEYS[2], ARGV[1])

redis.call('SADD', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

const dropScraperCache = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])
`

const renewSuccessScraperCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)
  redis.call('HINCRBY', KEYS[1], 'success_count', 1)
  redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[1])
  redis.call('HSET', KEYS[1], 'time', ARGV[2])
end

if redis.call('EXISTS', KEYS[2]) ~= 0 then
  redis.call('HINCRBY', KEYS[2], 'total_count', 1)
  redis.call('HINCRBY', KEYS[2], 'success_count', 1)
  redis.call('HINCRBY', KEYS[2], 'size_bytes', ARGV[1])
  redis.call('HSET', KEYS[2], 'time', ARGV[2])
end

return redis.status_reply('OK')
`

const renewFailedScraperCache = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  redis.call('HINCRBY', KEYS[1], 'total_count', 1)
  redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[1])
  redis.call('HSET', KEYS[1], 'time', ARGV[2])
end

if redis.call('EXISTS', KEYS[2]) ~= 0 then
  redis.call('HINCRBY', KEYS[2], 'total_count', 1)
  redis.call('HINCRBY', KEYS[2], 'size_bytes', ARGV[1])
  redis.call('HSET', KEYS[2], 'time', ARGV[2])
end

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchScraperCache', {
    numberOfKeys: 1,
    lua: fetchScraperCache
  })

  redis.defineCommand('fetchScrapers', {
    numberOfKeys: 1,
    lua: fetchScrapers
  })

  redis.defineCommand('saveScraperCache', {
    numberOfKeys: 3,
    lua: saveScraperCache
  })

  redis.defineCommand('dropScraperCache', {
    numberOfKeys: 3,
    lua: dropScraperCache
  })

  redis.defineCommand('renewSuccessScraperCache', {
    numberOfKeys: 2,
    lua: renewSuccessScraperCache
  })

  redis.defineCommand('renewFailedScraperCache', {
    numberOfKeys: 2,
    lua: renewFailedScraperCache
  })
}

export default initScripts
