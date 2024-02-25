import { Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'

export async function acquireHeartbeatLock(
  redis: Redis,
  lockSecret: string,
  lockTimeout: number,
  logger: Logger,
): Promise<boolean> {
  const lock = await redis.acquireHeartbeatLock(
    heartbeatLockKey(),
    lockSecret,
    lockTimeout
  )

  console.log('LOCK TYPEOF: ' + typeof lock)
  console.dir(lock)

  return !!lock
}

const heartbeatLockKey = () => ['system', 'heartbeat', 'lock'].join(':')
