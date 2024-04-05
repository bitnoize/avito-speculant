import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'
import { DatabaseMethod } from '../../database.js'

export type EnableProxyRequest = {
  proxyId: number
  data: ProxyLogData
}

export type EnableProxyResponse = {
  proxy: Proxy
  backLog: Notify[]
}

export type EnableProxy = DatabaseMethod<EnableProxyRequest, EnableProxyResponse>
