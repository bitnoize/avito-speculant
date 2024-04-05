import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'
import { DatabaseMethod } from '../../database.js'

export type DisableProxyRequest = {
  proxyId: number
  data: ProxyLogData
}

export type DisableProxyResponse = {
  proxy: Proxy
  backLog: Notify[]
}

export type DisableProxy = DatabaseMethod<DisableProxyRequest, DisableProxyResponse>
