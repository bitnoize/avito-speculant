import { curly } from 'node-libcurl'
import { TestRequest, TestResponse } from './worker-checkproxy.js'

export const testRequest: TestRequest = async (targetUrl, proxyUrl, timeoutMs) => {
  const startTime = Date.now()

  const testResponse: TestResponse = {
    statusCode: 0,
    testingTime: 0
  }

  try {
    const { statusCode } = await curly.get(targetUrl, {
      proxy: proxyUrl,
      timeoutMs
    })

    testResponse.statusCode = statusCode
  } catch (error) {
    testResponse.testError = error.message || 'unknown error'
  } finally {
    testResponse.testingTime = Date.now() - startTime
  }

  return testResponse
}
