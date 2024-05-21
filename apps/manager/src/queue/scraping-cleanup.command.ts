import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, scraperCacheService } from '@avito-speculant/redis'
import { queueService, scrapingService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-scraping-cleanup',
    description: 'ScrapingQueue remove orphan scrapers',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

      try {
        const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis, undefined)

        const repeatableJobs = await scrapingQueue.getRepeatableJobs()

        const scraperIds = scrapersCache.map((scraperCache) => scraperCache.id)
        const orphanScrapingJobs = repeatableJobs.filter((repeatableJob) => {
          if (repeatableJob.id == null) {
            throw new Error(`bla bla`)
          }

          return !scraperIds.includes(repeatableJob.id)
        })

        for (const orphanScrapingJob of orphanScrapingJobs) {
          await scrapingQueue.removeRepeatableByKey(orphanScrapingJob.key)

          logger.warn(`HeartbeatQueue remove orphan scraper '${orphanScrapingJob.id}'`)
        }
      } finally {
        await scrapingService.closeQueue(scrapingQueue)
        await redisService.closeRedis(redis)
      }
    }
  })
}
