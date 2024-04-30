import { Proxy } from '../proxy.js'
import { DatabaseMethod } from '../../database.js'

export type ListProxiesRequest = undefined

export type ListProxiesResponse = {
  proxies: Proxy[]
}

export type ListProxies = DatabaseMethod<ListProxiesRequest, ListProxiesResponse>
