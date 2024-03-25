import { command, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-create-plan',
    description: 'Database create plan',
    args: {
      categoriesMax: option({
        type: number,
        long: 'categories-max'
      }),
      priceRub: option({
        type: number,
        long: 'price-rub'
      }),
      durationDays: option({
        type: number,
        long: 'duration-days'
      }),
      intervalSec: option({
        type: number,
        long: 'interval-sec'
      }),
      analyticsOn: option({
        type: number,
        long: 'analytics-on'
      })
    },
    handler: async ({ categoriesMax, priceRub, durationDays, intervalSec, analyticsOn }) => {
      //if (
      //  categoriesMax < MINIMUM_PLAN_CATEGORIES_MAX ||
      //  categoriesMax > MAXIMUM_PLAN_CATEGORIES_MAX ||
      //) {
      // ...
      //}

      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      const { plan, backLog } = await planService.createPlan(db, {
        categoriesMax,
        priceRub,
        durationDays,
        intervalSec,
        analyticsOn: !!analyticsOn,
        data: {
          message: `Plan created via Manager`
        }
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'plan', plan.id)

      logger.info({ plan, backLog }, `Plan successfully created`)

      await treatmentService.closeQueue(treatmentQueue)
      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
