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
    handler: async (args) => {
      const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
      const db = databaseService.initDatabase(databaseConfig, logger)

      const redisOptions = redisService.getRedisOptions<Config>(config)
      const pubSub = redisService.initPubSub(redisOptions, logger)

      const response = await planService.enablePlan(db, {
        planId: args.planId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, response.backLog, logger)

      logger.info(response)

      await pubSub.disconnect()
      await db.destroy()
    }
  })
}
