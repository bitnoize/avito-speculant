import { Notify } from '@avito-speculant/notify'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface CreateProxyRequest {
  proxyUrl: string
  data: ProxyLogData
}

export interface CreateProxyResponse {
  message: string
  statusCode: number
  proxy: Proxy
  backLog: Notify[]
}
