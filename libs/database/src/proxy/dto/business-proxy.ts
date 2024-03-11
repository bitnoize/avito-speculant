import { Notify } from '@avito-speculant/notify'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'

export interface BusinessProxyRequest {
  proxyId: number
  data: ProxyLogData
}

export interface BusinessProxyResponse {
  message: string
  proxy: Proxy
  backLog: Notify[]
}
