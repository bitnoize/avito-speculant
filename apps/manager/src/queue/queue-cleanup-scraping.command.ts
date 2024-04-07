import { command } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { redisService, scraperCacheService } from '@avito-speculant/redis'
import { queueService, scrapingService, QueueJobLostIdError } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'queue-cleanup-scraping',
    description: 'Queue cleanup scraping',
    args: {},
    handler: async () => {
      const redisOptions = redisService.getRedisOptions<Config>(config)
      const redis = redisService.initRedis(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const scrapingQueue = scrapingService.initQueue(queueConnection, logger)

      const { scrapersCache } = await scraperCacheService.fetchScrapersCache(redis, undefined)

      const repeatableJobs = await scrapingQueue.getRepeatableJobs()

      const scraperIds = scrapersCache.map((scraperCache) => scraperCache.id)
      const orphanScrapingJobs = repeatableJobs.filter((repeatableJob) => {
        if (repeatableJob.id == null) {
          throw new QueueJobLostIdError({ repeatableJob })
        }

        return !scraperIds.includes(repeatableJob.id)
      })

      for (const orphanScrapingJob of orphanScrapingJobs) {
        await scrapingQueue.removeRepeatableByKey(orphanScrapingJob.key)

        const logData = {
          job: {
            id: orphanScrapingJob.id,
            key: orphanScrapingJob.key,
            name: orphanScrapingJob.name
          }
        }
        logger.warn(logData, `HeartbeatProcessor remove orphan scraper`)
      }

      await scrapingService.closeQueue(scrapingQueue)
      await redisService.closeRedis(redis)
    }
  })
}
