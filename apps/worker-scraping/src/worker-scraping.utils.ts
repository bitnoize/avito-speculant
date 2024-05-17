import _Ajv from 'ajv'
import * as fs from 'fs'
import { curly } from 'node-libcurl'
import { ScraperAdvert } from '@avito-speculant/redis'
import { StealRequest, StealResponse, ParseRequest, ParseResponse } from './worker-scraping.js'
import { avitoDesktopSchema } from './worker-scraping.schema.js'

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
    const validate = ajv.compile(avitoDesktopSchema)

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

    avitoRaw.data.catalog.items.forEach((item) => {
      const id = item.id ? item.id : null
      const title = item.title ? item.title : 'Неизвестно'
      const description = item.description ? item.description : 'Неизвестно'
      const urlPath = item.urlPath ? item.urlPath : null

      const price = (item.priceDetailed && item.priceDetailed.value) ? item.priceDetailed.value : 0
      const timestamp = item.sortTimeStamp ? item.sortTimeStamp : null
      const categoryName = (item.category && item.category.name) ? item.category.name : 'неизвестно'

      let imageUrl = 'https://placehold.co/600x400.png'

      if (item.images && item.images.length > 0) {
        const image = item.images[0]

        if (image['864x648']) {
          imageUrl = image['864x648']
        }
      }

      let age = 'неизвестно'

      if (item.iva && item.iva.DateInfoStep && item.iva.DateInfoStep.length > 0) {
        const dateInfo = item.iva.DateInfoStep[0]

        if (dateInfo.payload && dateInfo.payload.absolute) {
          age = dateInfo.payload.absolute
        }
      }

      if (id && urlPath && timestamp) {
        const scraperAdvert: ScraperAdvert = [
          id,
          title,
          description,
          categoryName,
          price,
          `https://avito.ru${urlPath}`,
          age,
          imageUrl,
          timestamp
        ]

        parseResponse.scraperAdverts.push(scraperAdvert)
      }
    })
  } catch (error) {
    parseResponse.parseError = error.message || 'Unknown error'
  } finally {
    parseResponse.parsingTime = Date.now() - startTime
  }

  return parseResponse
}
