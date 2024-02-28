import { User } from '@avito-speculant/domain'

export interface FetchScraperRequest {
  avitoUrl: string
}

export interface FetchScraperResponse {
  message: string
  statusCode: number
  scraperJobId?: number
  minIntervalSec?: number
}
