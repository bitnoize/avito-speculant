import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-disable-plan',
    description: 'Database disable plan',
    args: {
      planId: positional({
        type: number,
        displayName: 'planId'
      })
    },
    handler: async ({ planId }) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const disabledPlan = await planService.disablePlan(db, {
        planId,
        data: {
          message: `Plan disabled via Manager`
        }
      })

      logger.info(disabledPlan)

      await redisService.publishBackLog(pubSub, disabledPlan.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
