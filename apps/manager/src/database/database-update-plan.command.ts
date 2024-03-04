import { command, positional, option, optional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-update-plan',
    description: 'Database update plan',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      }),
      categoriesMax: option({
        type: optional(number),
        long: 'categories-max'
      }),
      priceRub: option({
        type: optional(number),
        long: 'price-rub'
      }),
      durationDays: option({
        type: optional(number),
        long: 'duration-days'
      }),
      intervalSec: option({
        type: optional(number),
        long: 'interval-sec'
      }),
      analyticsOn: option({
        type: optional(number),
        long: 'analytics-on'
      })
    },
    handler: async ({ planId, categoriesMax, priceRub, durationDays, intervalSec, analyticsOn }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const updatedPlan = await planService.updatePlan(db, {
        planId,
        categoriesMax,
        priceRub,
        durationDays,
        intervalSec,
        analyticsOn: analyticsOn === undefined ? undefined : !!analyticsOn,
        data: {
          message: `Plan updated via Manager`
        }
      })

      logger.info(updatedPlan)

      await redisService.publishBackLog(pubSub, updatedPlan.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
