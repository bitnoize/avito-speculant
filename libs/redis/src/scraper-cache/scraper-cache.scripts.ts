import { InitScripts } from '../redis.js'

const fetchScraperCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'url_path',
  'total_count',
  'success_count',
  'size_bytes'
)
`

const fetchScraperLink = `
return redis.call('GET', KEYS[1])
`

const fetchScrapersIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveScraperCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'url_path', ARGV[2]
)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('HSETNX', KEYS[1], 'size_bytes', 0)

return redis.status_reply('OK')
`

const saveScraperLink = `
redis.call('SET', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const saveScrapersIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const saveSuccessScraperCache = `
if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'success_count', 1)
redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[1])

return redis.status_reply('OK')
`

const saveFailedScraperCache = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[1])

return redis.status_reply('OK')
`

const dropScraperCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropScrapersIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchScraperCache', {
    numberOfKeys: 1,
    lua: fetchScraperCache
  })

  redis.defineCommand('fetchScraperLink', {
    numberOfKeys: 1,
    lua: fetchScraperLink
  })

  redis.defineCommand('fetchScrapersIndex', {
    numberOfKeys: 1,
    lua: fetchScrapersIndex
  })

  redis.defineCommand('saveScraperCache', {
    numberOfKeys: 1,
    lua: saveScraperCache
  })

  redis.defineCommand('saveUrlPathScraperLink', {
    numberOfKeys: 1,
    lua: saveUrlPathScraperId
  })

  redis.defineCommand('saveScrapersIndex', {
    numberOfKeys: 1,
    lua: saveScrapersIndex
  })

  redis.defineCommand('saveSuccessScraperCache', {
    numberOfKeys: 1,
    lua: saveSuccessScraperCache
  })

  redis.defineCommand('saveFailedScraperCache', {
    numberOfKeys: 1,
    lua: saveFailedScraperCache
  })

  redis.defineCommand('dropScraperCache', {
    numberOfKeys: 1,
    lua: dropScraperCache
  })

  redis.defineCommand('dropScrapersIndex', {
    numberOfKeys: 1,
    lua: dropScrapersIndex
  })
}

export default initScripts
