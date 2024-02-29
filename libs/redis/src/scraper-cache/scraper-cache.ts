export interface UserCache {
  id: number
}

export interface CategoryCache {
  id: number
  scraperJobId: number
  intervalSec: number

}

export interface ScraperCache {
  jobId: number
  avitoUrl: string
  intervalSec: number
}
