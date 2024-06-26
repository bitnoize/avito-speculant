import { RedisInternalError } from './redis.errors.js'

export const parseNumber = (result: unknown, message: string): number => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!(typeof result === 'string' && result.length > 0)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  const value = parseInt(result)

  if (Number.isNaN(value)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return value
}

export const parseNumberOrNull = (result: unknown, message: string): number | null => {
  if (result == null) {
    return null
  }

  if (!(typeof result === 'string' && result.length > 0)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  const value = parseInt(result)

  if (Number.isNaN(value)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return value
}

export const parseManyNumbers = (result: unknown, message: string): number[] => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!Array.isArray(result)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result.map((res) => parseNumber(res, message))
}

export const parseString = (result: unknown, message: string): string => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!(typeof result === 'string' && result.length > 0)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result
}

export const parseStringOrNull = (result: unknown, message: string): string | null => {
  if (result == null) {
    return null
  }

  if (!(typeof result === 'string' && result.length > 0)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result
}

export const parseManyStrings = (result: unknown, message: string): string[] => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!Array.isArray(result)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result.map((res) => parseString(res, message))
}

export const parseHash = (result: unknown, length: number, message: string): unknown[] => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!(Array.isArray(result) && result.length === length)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result
}

export const parsePipeline = (result: unknown, message: string): unknown[] => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!Array.isArray(result)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result
}

export const parseCommand = (result: unknown, message: string): unknown => {
  if (result == null) {
    throw new RedisInternalError({ result }, 190, message)
  }

  if (!(Array.isArray(result) && result.length == 2 && result[0] === null)) {
    throw new RedisInternalError({ result }, 190, message)
  }

  return result[1]
}
