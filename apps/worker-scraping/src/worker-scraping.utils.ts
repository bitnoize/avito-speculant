//import * as fs from 'fs'
import _Ajv from 'ajv'
import { curly, CurlyResult } from 'node-libcurl'
import { CurlRequest, ParseAttempt } from './worker-scraping.js'
import { avitoDesktopSchema } from './worker-scraping.schema.js'

const Ajv = _Ajv.default

export const curlRequest: CurlRequest = async (url, proxyUrl, timeoutMs, verbose) => {
  try {
    const { statusCode, data } = await curly.get(url, {
      proxy: proxyUrl,
      timeoutMs,
      verbose
    })

    return {
      statusCode,
      body: data
    }
  } catch (error) {
    return {
      statusCode: 0,
      body: Buffer.alloc(0),
      error: error.message
    }
  }
}

export const parseAttempt: ParseAttempt = (body) => {
  try {
    const ajv = new Ajv()
    const validate = ajv.compile(avitoDesktopSchema)

    const str = body.toString()

    const indexStart = str.indexOf('window.__initial') + 'window.__initialData__ = "'.length
    const indexEnd = str.indexOf('window.__locations__')
    const initialData = str.substring(indexStart, indexEnd).trim().slice(0, -2)

    const json = JSON.parse(decodeURIComponent(initialData))
    //fs.writeFileSync('/tmp/data.json', JSON.stringify(ads))

    if (typeof json !== 'object') {
      return {
        avitoAdverts: [],
        error: `Not and object JSON`
      }
    }

    const avitoKey = Object.keys(json).find((key) => key.startsWith('@avito/bx-single-page'))

    if (avitoKey === undefined) {
      return {
        avitoAdverts: [],
        error: `AvitoKey not found in JSON`
      }
    }

    const raw = json[avitoKey]

    if (!validate(raw)) {
      return {
        avitoAdverts: [],
        error: `Avito JSON is not valid`
      }
    }

    const avitoAdverts = raw.data.catalog.items.map((item) => ({
      id: item.id,
      title: item.title,
      priceRub: 0,
      url: 'https://...',
      age: 0,
      imageUrl: 'https://...'
    }))

    return {
      avitoAdverts
    }
  } catch (error) {
    return {
      avitoAdverts: [],
      error: error.message
    }
  }
}
