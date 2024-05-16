import _Ajv from 'ajv'
import * as fs from 'fs'
import { curly } from 'node-libcurl'
import { ScraperAdvert } from '@avito-speculant/redis'
import { StealRequest, StealResponse, ParseRequest, ParseResponse } from './worker-scraping.js'
import { avitoDataSchema } from './worker-scraping.schema.js'

const Ajv = _Ajv.default

export const stealRequest: StealRequest = async (targetUrl, proxyUrl, timeoutMs) => {
  const startTime = Date.now()

  const stealResponse: StealResponse = {
    statusCode: 0,
    body: Buffer.alloc(0),
    stealingTime: 0
  }

  try {
    const { statusCode, data } = await curly.get(targetUrl, {
      proxy: proxyUrl,
      timeoutMs
    })

    if (statusCode === 200) {
      stealResponse.body = data
    }

    stealResponse.statusCode = statusCode
  } catch (error) {
    stealResponse.stealError = error.message || 'Unknown error'
  } finally {
    stealResponse.stealingTime = Date.now() - startTime
  }

  return stealResponse
}

export const parseRequest: ParseRequest = (scraperId, body) => {
  const startTime = Date.now()

  const parseResponse: ParseResponse = {
    scraperAdverts: [],
    parsingTime: 0
  }

  try {
    const ajv = new Ajv()
    const validate = ajv.compile(avitoDataSchema)

    const str = body.toString()

    const indexStart = str.indexOf('window.__initial') + 'window.__initialData__ = "'.length
    const indexEnd = str.indexOf('window.__mfe__')

    if (!(indexStart > 0 && indexEnd > 0)) {
      throw new Error('initialData not found')
    }

    const initialData = str.substring(indexStart, indexEnd).trim().slice(0, -2)
    const json = JSON.parse(decodeURIComponent(initialData))

    if (typeof json !== 'object') {
      throw new Error('Not and object JSON')
    }

    const avitoKey = Object.keys(json).find((key) => key.startsWith('@avito/bx-single-page'))

    if (avitoKey === undefined) {
      throw new Error('AvitoKey not found in JSON')
    }

    const avitoRaw = json[avitoKey]

    if (!validate(avitoRaw)) {
      console.error(validate.errors)
      //fs.writeFileSync('/tmp/initialData.txt', JSON.stringify(validate.errors, null, 2), 'utf-8')
      throw new Error('AvitoRaw is not valid object')
    }

    const scraperAdverts = avitoRaw.data.catalog.items.map((item): ScraperAdvert => {
      const url = 'https://avito.ru' + item.urlPath

      const age =
        item.iva.DateInfoStep.length > 0
          ? item.iva.DateInfoStep[0].payload.absolute ?? 'неизвестно'
          : 'неизвестно'

      const imageUrl = item.images.length > 0 ? item.images[0]['864x648'] : ''

      return [
        item.id,
        item.title,
        item.description,
        item.category.name,
        item.priceDetailed.value,
        url,
        age,
        imageUrl,
        item.sortTimeStamp
      ]
    })

    parseResponse.scraperAdverts = scraperAdverts
  } catch (error) {
    parseResponse.parseError = error.message || 'Unknown error'
  } finally {
    parseResponse.parsingTime = Date.now() - startTime
  }

  return parseResponse
}
