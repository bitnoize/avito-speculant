import { AvitoAdvert } from '../advert-cache.js'

export interface SaveAdvertsCacheRequest {
  scraperId: string
  avitoAdverts: AvitoAdvert[]
}
