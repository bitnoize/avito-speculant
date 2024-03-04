import { v4 as uuidv4 } from 'uuid'

export const randomHash = (): string => uuidv4().replaceAll('-', '')

export const parseNumber = (result: unknown): number => {
  if (!(result != null && typeof result === 'string' && result.length > 0)) {
    throw new TypeError(`Redis malformed result`)
  }

  const value = parseInt(result)

  if (Number.isNaN(value)) {
    throw new TypeError(`Redis malformed value`)
  }

  return value
}

export const parseManyNumbers = (results: unknown): number[] => {
  if (!Array.isArray(results)) {
    throw new TypeError(`Redis malformed result`)
  }

  return results.map((result) => parseNumber(result))
}

export const parseString = (result: unknown): string => {
  if (!(result != null && typeof result === 'string')) {
    throw new TypeError(`parseString malformed result`)
  }

  return result
}

export const parseManyStrings = (results: unknown): string[] => {
  if (!Array.isArray(results)) {
    throw new TypeError(`Redis malformed result`)
  }

  return results.map((result) => parseString(result))
}
