import { curly, CurlyResult } from 'node-libcurl'
import { CurlRequest } from './worker-proxycheck.js'

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
