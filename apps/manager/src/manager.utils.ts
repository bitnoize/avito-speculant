import { Type, extendType, number } from 'cmd-ts'

export const Serial: Type<string, number> = extendType(number, {
  description: 'entity identifier',
  async from(n) {
    return checkIntegerRange(n, 1, 2147483647)
  }
})

export const Limit: Type<string, number> = extendType(number, {
  description: 'entities in collection',
  async from(n) {
    return checkIntegerRange(n, 1, 1000)
  }
})

export const CategoriesMax: Type<string, number> = extendType(number, {
  description: 'maximum categories',
  async from(n) {
    return checkIntegerRange(n, 1, 100)
  }
})

export const PriceRub: Type<string, number> = extendType(number, {
  description: 'price in rubles',
  async from(n) {
    return checkIntegerRange(n, 100, 10_000)
  }
})

export const DurationDays: Type<string, number> = extendType(number, {
  description: 'duration days',
  async from(n) {
    return checkIntegerRange(n, 1, 365)
  }
})

export const IntervalSec: Type<string, number> = extendType(number, {
  description: 'interval seconds',
  async from(n) {
    return checkIntegerRange(n, 1, 3600)
  }
})

const checkIntegerRange = (n: number, min: number, max: number): number => {
  if (!(Math.round(n) === n && n >= min && n <= max)) {
    throw new Error(`not an integer between ${min} and ${max}`)
  }

  return n
}
