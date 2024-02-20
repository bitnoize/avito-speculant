import { command, option, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
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
    handler: async (args) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const response = await planService.createPlan(db, {
        categoriesMax: args.categoriesMax,
        priceRub: args.priceRub,
        durationDays: args.durationDays,
        intervalSec: args.intervalSec,
        analyticsOn: !!args.analyticsOn,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)

      await redisService.closePubSub(pubSub, logger)
      await databaseService.closeDatabase(db, logger)
    }
  })
}
