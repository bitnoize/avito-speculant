export interface ScraperJobCache {
  id: number
  avitoUrl: string
  intervalSec: number
}

export interface CategoryCache {
  id: number
  scraperJobId: number
  intervalSec: number

}

export interface UserCache {
  id: number
}
