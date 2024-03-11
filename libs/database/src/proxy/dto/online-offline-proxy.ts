import { Notify } from '@avito-speculant/notify'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface OnlineOfflineProxyRequest {
  proxyId: number
  data: ProxyLogData
}

export interface OnlineOfflineProxyResponse {
  message: string
  proxy: Proxy
  backLog: Notify[]
}
