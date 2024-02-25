export const cacheStoreUser = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'tg_from_id', ARGV[2],
  'status', ARGV[3],
  'subscriptions', ARGV[4],
  'categories', ARGV[5],
  'created_at', ARGV[6],
  'updated_at', ARGV[7],
  'queued_at', ARGV[8],
  'is_dirty', 0
)

return redis.status_reply('OK')
`

export const cacheFetchUser = `
if redis.call('EXISTS', KEYS[1]) ~= 0 then
  return false
end

local user = redis.call(
  'HMGET', KEYS[1],
  'id',
  'tg_from_id',
  'status',
  'subscriptions',
  'categories',
  'created_at',
  'updated_at',
  'queued_at',
  'is_dirty'
)

return {
  unpack(user)
}
`
