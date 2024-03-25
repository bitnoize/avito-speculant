import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface CreateProxyRequest {
  proxyUrl: string
  data: ProxyLogData
}

export interface CreateProxyResponse {
  proxy: Proxy
  backLog: Notify[]
}
