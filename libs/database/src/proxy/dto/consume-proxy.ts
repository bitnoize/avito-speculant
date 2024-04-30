import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeProxyRequest = {
  proxyId: number
  data: ProxyLogData
}

export type ConsumeProxyResponse = {
  proxy: Proxy
}

export type ConsumeProxy = DatabaseMethod<ConsumeProxyRequest, ConsumeProxyResponse>
