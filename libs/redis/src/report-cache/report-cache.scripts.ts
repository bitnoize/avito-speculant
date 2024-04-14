import { InitScripts } from '../redis.js'

const fetchReportCache = `
return redis.call(
  'HMGET', KEYS[1],
  'id',
  'category_id',
  'advert_id',
  'tg_from_id',
  'posted_at',
  'attempt',
  'time'
)
`

const stampReportCache = `
if redis.call('ZSCORE', KEYS[2], ARGV[1]) == false then
  return nil
end

if redis.call('EXISTS', KEYS[1]) ~= 1 then
  return nil
end

redis.call('HINCRBY', KEYS[1], 'attempt', 1)

return redis.call(
  'HMGET', KEYS[1],
  'id',
  'category_id',
  'advert_id',
  'tg_from_id',
  'posted_at',
  'attempt',
  'time'
)
`

const fetchReports = `
return redis.call('ZRANGE', KEYS[1], 0, ARGV[1])
`

const saveReportCache = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'category_id', ARGV[2],
  'advert_id', ARGV[3],
  'tg_from_id', ARGV[4],
  'posted_at', ARGV[5],
  'time', ARGV[6]
)

redis.call('HSETNX', KEYS[1], 'attempt', 0)

redis.call('ZADD', KEYS[2], ARGV[5], ARGV[1])

return redis.status_reply('OK')
`

const dropReportCache = `
redis.call('DEL', KEYS[1])

redis.call('ZREM', KEYS[2], ARGV[1])

redis.call('ZREM', KEYS[3], ARGV[2])

redis.call('ZADD', KEYS[4], ARGV[3], ARGV[2])

return redis.status_reply('OK')
`

const initScripts: InitScripts = (redis) => {
  redis.defineCommand('fetchReportCache', {
    numberOfKeys: 1,
    lua: fetchReportCache
  })

  redis.defineCommand('stampReportCache', {
    numberOfKeys: 2,
    lua: stampReportCache
  })

  redis.defineCommand('fetchReports', {
    numberOfKeys: 1,
    lua: fetchReports
  })

  redis.defineCommand('saveReportCache', {
    numberOfKeys: 2,
    lua: saveReportCache
  })

  redis.defineCommand('dropReportCache', {
    numberOfKeys: 4,
    lua: dropReportCache
  })
}

export default initScripts
