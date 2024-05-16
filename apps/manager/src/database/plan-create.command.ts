import { command, option, flag, boolean } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import { Config, InitCommand } from '../manager.js'
import { CategoriesMax, PriceRub, DurationDays, IntervalSec } from '../manager.utils.js'

const initCommand: InitCommand = (config, logger) => {
  return command({
    name: 'database-plan-create',
    description: 'create plan',
    args: {
      categoriesMax: option({
        type: CategoriesMax,
        long: 'categories-max',
        short: 'c',
        description: 'maximum categories'
      }),
      durationDays: option({
        type: DurationDays,
        long: 'duration-days',
        short: 'd',
        description: 'duration days'
      }),
      intervalSec: option({
        type: IntervalSec,
        long: 'interval-sec',
        short: 'i',
        description: 'interval seconds'
      }),
      analyticsOn: flag({
        type: boolean,
        long: 'analytics-on',
        short: 'a',
        description: 'enable analytics',
        defaultValue: () => false,
        defaultValueIsSerializable: true
      }),
      priceRub: option({
        type: PriceRub,
        long: 'price-rub',
        short: 'p',
        description: 'price in rubles'
      })
    },
    handler: async ({ categoriesMax, priceRub, durationDays, intervalSec, analyticsOn }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const queueConnection = queueService.getQueueConnection<Config>(config)
      const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

      try {
        const { plan, backLog } = await planService.createPlan(db, {
          categoriesMax,
          durationDays,
          intervalSec,
          analyticsOn,
          priceRub,
          data: {}
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'plan', plan.id)

        logger.info({ plan, backLog }, `Plan created`)
      } finally {
        await treatmentService.closeQueue(treatmentQueue)
        await redisService.closePubSub(pubSub)
        await databaseService.closeDatabase(db)
      }
    }
  })
}

export default initCommand
