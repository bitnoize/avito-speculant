import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface EnableDisableProxyRequest {
  proxyId: number
  data: ProxyLogData
}

export interface EnableDisableProxyResponse {
  proxy: Proxy
  backLog: Notify[]
}
