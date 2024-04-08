import _Ajv from 'ajv'
import { curly, CurlyResult } from 'node-libcurl'
import { AvitoAdvert } from '@avito-speculant/redis'
import { CurlRequest, ParseAttempt } from './worker-scraping.js'
import { avitoDataSchema } from './worker-scraping.schema.js'

const Ajv = _Ajv.default

// Моментально, 15 сек, 1 минута, 10 минут
export const timeoutAdjust = (intervalSec: number): number => {
  if (intervalSec > 0 && intervalSec <= 1) {
    return 900
  } else if (intervalSec > 1 && intervalSec <= 2) {
    return 1_000
  } else if (intervalSec > 2 && intervalSec <= 10) {
    return (intervalSec - 1) * 1000
  } else if (intervalSec > 10 && intervalSec <= 3600) {
    return 10_000
  } else {
    throw new TypeError(`Wrong intervalSec: ${intervalSec}`)
  }
}

export const curlRequest: CurlRequest = async (url, proxyUrl, timeoutMs, verbose) => {
  try {
    const startTime = Date.now()

    const { statusCode, data } = await curly.get(url, {
      proxy: proxyUrl,
      timeoutMs,
      verbose
    })

    return {
      statusCode,
      body: data,
      sizeBytes: data.length,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    return {
      statusCode: 0,
      body: Buffer.alloc(0),
      sizeBytes: 0,
      durationTime: 0,
      error: error.message || `Curl unknown error`
    }
  }
}

export const parseAttempt: ParseAttempt = (body) => {
  try {
    const startTime = Date.now()

    const ajv = new Ajv()
    const validate = ajv.compile(avitoDataSchema)

    const str = body.toString()

    const indexStart = str.indexOf('window.__initial') + 'window.__initialData__ = "'.length
    const indexEnd = str.indexOf('window.__locations__')
    const initialData = str.substring(indexStart, indexEnd).trim().slice(0, -2)

    const json = JSON.parse(decodeURIComponent(initialData))

    if (typeof json !== 'object') {
      return {
        avitoAdverts: [],
        totalAdverts: 0,
        durationTime: Date.now() - startTime,
        error: `Not and object JSON`
      }
    }

    const avitoKey = Object.keys(json).find((key) => key.startsWith('@avito/bx-single-page'))

    if (avitoKey === undefined) {
      return {
        avitoAdverts: [],
        totalAdverts: 0,
        durationTime: Date.now() - startTime,
        error: `AvitoKey not found in JSON`
      }
    }

    const avitoRaw = json[avitoKey]

    if (!validate(avitoRaw)) {
      return {
        avitoAdverts: [],
        totalAdverts: 0,
        durationTime: Date.now() - startTime,
        error: `AvitoRaw is not valid object`
      }
    }

    const avitoAdverts = avitoRaw.data.catalog.items.map((item): AvitoAdvert => ([
      item.id,
      item.title,
      item.description,
      item.priceDetailed.value,
      'https://avito.ru' + item.urlPath,
      item.iva.DateInfoStep[0].payload.absolute || 'unknown',
      item.images[0]['208x156']
    ]))

    return {
      avitoAdverts,
      totalAdverts: avitoAdverts.length,
      durationTime: Date.now() - startTime
    }
  } catch (error) {
    return {
      avitoAdverts: [],
      totalAdverts: 0,
      durationTime: 0,
      error: error.message || `Parse unknown error`
    }
  }
}
