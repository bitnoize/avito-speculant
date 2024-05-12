import { Notify } from '@avito-speculant/common'
import { Proxy } from '../proxy.js'
import { ProxyLogData } from '../../proxy-log/proxy-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreateProxyRequest = {
  url: string
  data: ProxyLogData
}

export type CreateProxyResponse = {
  proxy: Proxy
  backLog: Notify[]
}

export type CreateProxy = DatabaseMethod<CreateProxyRequest, CreateProxyResponse>
