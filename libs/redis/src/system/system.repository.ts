export const acquireHeartbeatLockLua = `
local lock = redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2], 'NX')

if lock == false then
  return false
end

return true
`

export const renewalHeartbeatLockLua = `
local secret = redis.call('GET', KEYS[1])

if secret == false or secret ~= ARGV[1] then
  return false
end

redis.call('PEXPIRE', KEYS[1], ARGV[2])

return true
`

export const storeModelLua = `

`
export const fetchModelLua = `
redis.call('HSETNX', KEYS[1], 'is_running', 0)

local system_status = redis.call(
  'HMGET', KEYS[1],
  'is_running'
)

return {
  unpack(system_status)
}
`
