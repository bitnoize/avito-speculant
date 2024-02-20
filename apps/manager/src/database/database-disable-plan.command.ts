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
    handler: async (args) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const response = await planService.disablePlan(db, {
        planId: args.planId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, logger, response.backLog)

      logger.info(response)

      await redisService.closePubSub(pubSub, logger)
      await databaseService.closeDatabase(db, logger)
    }
  })
}
