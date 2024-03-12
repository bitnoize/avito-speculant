import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { redisService } from '@avito-speculant/redis'
import { SendreportProcessor } from '@avito-speculant/queue'
import { Config } from './worker-sendreport.js'
import { configSchema } from './worker-sendreport.schema.js'

const sendreportProcessor: SendreportProcessor = async (sendreportJob) => {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  logger.info(`SendreportJob complete`)

  await redisService.closeRedis(redis)
}

export default sendreportProcessor
