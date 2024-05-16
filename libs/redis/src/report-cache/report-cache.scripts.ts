import { InitScripts } from '../redis.js'

const fetchReportCache = `
return redis.call(
  'HMGET', KEYS[1],
  'scraper_id',
  'category_id',
  'advert_id',
  'tg_from_id',
  'token',
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
  'scraper_id',
  'category_id',
  'advert_id',
  'tg_from_id',
  'token',
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
  'scraper_id', ARGV[1],
  'category_id', ARGV[2],
  'advert_id', ARGV[3],
  'tg_from_id', ARGV[4],
  'token', ARGV[5],
  'posted_at', ARGV[6]
)
redis.call('HSETNX', KEYS[1], 'attempt', 0)

return redis.status_reply('OK')
`

const saveSkipReportsIndex = `
redis.call('DEL', KEYS[2])

local done_reports = redis.call(
  'ZDIFF', 3,
  KEYS[1],
  KEYS[3],
  KEYS[4],
  'WITHSCORES'
)

if #done_reports > 0 then
  for i = 1, #done_reports/2 do
    done_reports[2*i-1], done_reports[2*i] = done_reports[2*i], done_reports[2*i-1]
  end

  redis.call('ZADD', KEYS[4], unpack(done_reports))
end

return redis.status_reply('OK')
`

const saveWaitReportsIndex = `
local wait_reports = redis.call(
  'ZDIFF', 4,
  KEYS[1],
  KEYS[2],
  KEYS[3],
  KEYS[4],
  'WITHSCORES'
)

if #wait_reports >= 2 then
  for i = 1, #wait_reports/2 do
    wait_reports[2*i-1], wait_reports[2*i] = wait_reports[2*i], wait_reports[2*i-1]
  end

  redis.call('ZADD', KEYS[2], unpack(wait_reports))
end

return redis.status_reply('OK')
`

const saveSendReportsIndex = `
local count = tonumber(ARGV[1]) - tonumber(redis.call('ZCARD', KEYS[2]))

if count > 0 then
  local send_reports = redis.call('ZPOPMIN', KEYS[1], count)
  if #send_reports >= 2 then
    for i = 1, #send_reports/2 do
      send_reports[2*i-1], send_reports[2*i] = send_reports[2*i], send_reports[2*i-1]
    end

    redis.call('ZADD', KEYS[2], unpack(send_reports))
  end
end

return redis.status_reply('OK')
`

const saveDoneReportsIndex = `
redis.call('ZREM', KEYS[1], ARGV[1])
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[1])

return redis.status_reply('OK')
`

const dropReportCache = `
redis.call('DEL', KEYS[1])

return redis.status_reply('OK')
`

//const dropReportsIndex = `
//redis.call('ZREM', KEYS[1], ARGV[1])
//
//return redis.status_reply('OK')
//`

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

  redis.defineCommand('saveSkipReportsIndex', {
    numberOfKeys: 4,
    lua: saveSkipReportsIndex
  })

  redis.defineCommand('saveWaitReportsIndex', {
    numberOfKeys: 4,
    lua: saveWaitReportsIndex
  })

  redis.defineCommand('saveSendReportsIndex', {
    numberOfKeys: 2,
    lua: saveSendReportsIndex
  })

  redis.defineCommand('saveDoneReportsIndex', {
    numberOfKeys: 2,
    lua: saveDoneReportsIndex
  })

  redis.defineCommand('dropReportCache', {
    numberOfKeys: 1,
    lua: dropReportCache
  })

//redis.defineCommand('dropReportsIndex', {
//  numberOfKeys: 1,
//  lua: dropReportsIndex
//})
}

export default initScripts
