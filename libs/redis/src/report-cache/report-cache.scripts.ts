import { InitScripts } from '../redis.js'

const fetchReportCache = `
return redis.call(
  'HMGET', KEYS[1],
  'category_id',
  'advert_id',
  'tg_from_id',
  'posted_at',
  'attempt'
)
`

const stampReportCache = `
if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return false
end

redis.call('HINCRBY', KEYS[1], 'attempt', 1)

return redis.call(
  'HMGET', KEYS[1],
  'category_id',
  'advert_id',
  'tg_from_id',
  'posted_at',
  'attempt'
)
`

const fetchReportsIndex = `
return redis.call('ZRANGE', KEYS[1], 0, -1)
`

const saveReportCache = `
redis.call(
  'HSET', KEYS[1],
  'category_id', ARGV[1],
  'advert_id', ARGV[2],
  'tg_from_id', ARGV[3],
  'posted_at', ARGV[4]
)
redis.call('HSETNX', KEYS[1], 'attempt', 0)

return redis.status_reply('OK')
`

const saveReportsIndex = `
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropReportCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

const dropReportsIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchReportCache', {
    numberOfKeys: 1,
    lua: fetchReportCache
  })

  redis.defineCommand('stampReportCache', {
    numberOfKeys: 1,
    lua: stampReportCache
  })

  redis.defineCommand('fetchReportsIndex', {
    numberOfKeys: 1,
    lua: fetchReportsIndex
  })

  redis.defineCommand('saveReportCache', {
    numberOfKeys: 1,
    lua: saveReportCache
  })

  redis.defineCommand('saveReportsIndex', {
    numberOfKeys: 1,
    lua: saveReportsIndex
  })

  redis.defineCommand('dropReportCache', {
    numberOfKeys: 1,
    lua: dropReportCache
  })

  redis.defineCommand('dropReportsIndex', {
    numberOfKeys: 1,
    lua: dropReportsIndex
  })
}

export default initScripts
