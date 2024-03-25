import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface ConsumeProxyRequest {
  proxyId: number
  data: ProxyLogData
}

export interface ConsumeProxyResponse {
  proxy: Proxy
  backLog: Notify[]
}
