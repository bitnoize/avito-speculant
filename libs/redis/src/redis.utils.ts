import { v4 as uuidv4 } from 'uuid'
import { USER_STATUSES, SUBSCRIPTION_STATUSES, UserStatus, SubscriptionStatus } from '@avito-speculant/domain'

export const randomHash = (): string => uuidv4().replaceAll('-', '')

export const parseNumber = (result: unknown): number => {
  if (!(result != null && typeof result === 'string' && result.length > 0)) {
    throw new TypeError(`parseNumber malformed result`)
  }

  const value = parseInt(result)

  if (Number.isNaN(value)) {
    throw new TypeError(`parseNumber malformed value`)
  }

  return value
}

export const parseString = (result: unknown): string => {
  if (!(result != null && typeof result === 'string')) {
    throw new TypeError(`parseString malformed result`)
  }

  return result
}

export const parseUserStatus = (result: unknown): UserStatus => {
  if (!(result != null && typeof result === 'string' && USER_STATUSES.includes(result))) {
    throw new TypeError(`parseUserStatus malformed result`)
  }

  return result
}

export const parseSubscriptionStatus = (result: unknown): SubscriptionStatus => {
  if (!(result != null && typeof result === 'string' && SUBSCRIPTION_STATUSES.includes(result))) {
    throw new TypeError(`parseSubscriptionStatus malformed result`)
  }

  return result
}
