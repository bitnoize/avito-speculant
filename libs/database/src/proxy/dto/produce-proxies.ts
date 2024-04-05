import { Proxy } from '../proxy.js'
import { DatabaseMethod } from '../../database.js'

export type ProduceProxiesRequest = {
  limit: number
}

export type ProduceProxiesResponse = {
  proxies: Proxy[]
}

export type ProduceProxies = DatabaseMethod<ProduceProxiesRequest, ProduceProxiesResponse>
