import { command, positional, number } from 'cmd-ts'
import { Logger } from '@avito-speculant/logger'
import { databaseService, planService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from '../manager.js'

export default (config: Config, logger: Logger) => {
  return command({
    name: 'database-enable-plan',
    description: 'Database enable plan',
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

      const enabledPlan = await planService.enablePlan(db, {
        planId,
        data: {
          message: `Plan enabled via Manager`
        }
      })

      logger.info(enabledPlan)

      await redisService.publishBackLog(pubSub, enabledPlan.backLog)

      await redisService.closePubSub(pubSub)
      await databaseService.closeDatabase(db)
    }
  })
}
