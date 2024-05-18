import { HttpsProxyAgent } from 'https-proxy-agent'
import { Bot } from 'grammy'
import { TestRequest, TestResponse } from './worker-checkbot.js'

export const testRequest: TestRequest = async (token, proxyUrl) => {
  const startTime = Date.now()

  const testResponse: TestResponse = {
    tgFromId: '',
    username: '',
    testingTime: 0
  }

  try {
    const bot = new Bot(token, {
      client: {
        baseFetchConfig: {
          agent: new HttpsProxyAgent(proxyUrl),
          compress: true
        }
      }
    })

    const botInfo = await bot.api.getMe()

    testResponse.tgFromId = botInfo.id.toString()
    testResponse.username = botInfo.username
  } catch (error) {
    testResponse.testError = error.message || 'unknown error'
  } finally {
    testResponse.testingTime = Date.now() - startTime
  }

  return testResponse
}
