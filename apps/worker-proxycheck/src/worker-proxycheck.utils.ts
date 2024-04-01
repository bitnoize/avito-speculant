import { curly, CurlyResult } from 'node-libcurl'
import { CurlRequest } from './worker-proxycheck.js'

export const curlRequest: CurlRequest = async (checkUrl, proxyUrl, timeoutMs, verbose) => {
  try {
    const { statusCode, data } = await curly.get(checkUrl, {
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
