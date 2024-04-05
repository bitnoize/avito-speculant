import { Proxy } from '../proxy.js'
import { DatabaseMethod } from '../../database.js'

export type ListProxiesRequest = {
  all?: boolean
}

export type ListProxiesResponse = {
  proxies: Proxy[]
}

export type ListProxies = DatabaseMethod<ListProxiesRequest, ListProxiesResponse>
