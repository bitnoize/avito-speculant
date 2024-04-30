import { Proxy } from '../proxy.js'
import { DatabaseMethod } from '../../database.js'

export type ReadProxyRequest = {
  proxyId: number
}

export type ReadProxyResponse = {
  proxy: Proxy
}

export type ReadProxy = DatabaseMethod<ReadProxyRequest, ReadProxyResponse>
