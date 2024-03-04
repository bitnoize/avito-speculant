import { Redis } from 'ioredis'

export async function acquireHeartbeatLock(
  redis: Redis,
  lockSecret: string,
  lockTimeout: number
): Promise<boolean> {
  const lock = await redis.acquireHeartbeatLock(heartbeatLockKey(), lockSecret, lockTimeout)

  console.log('LOCK TYPEOF: ' + typeof lock)
  console.dir(lock)

  return !!lock
}

const heartbeatLockKey = () => ['system', 'heartbeat', 'lock'].join(':')
