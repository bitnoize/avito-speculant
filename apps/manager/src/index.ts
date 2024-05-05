import { binary, subcommands, run } from 'cmd-ts'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import { Config, InitSubcommands } from './manager.js'
import { configSchema } from './manager.schema.js'
import systemSubcommands from './system/index.js'
import databaseSubcommands from './database/index.js'
import redisSubcommands from './redis/index.js'
import queueSubcommands from './queue/index.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'avito-speculant-manager',
    description: `manage Avito-Speculant distributed cluster`,
    cmds: {
      system: systemSubcommands(config, logger),
      database: databaseSubcommands(config, logger),
      redis: redisSubcommands(config, logger),
      queue: queueSubcommands(config, logger)
    }
  })
}

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  try {
    const app = initSubcommands(config, logger)

    const binaryApp = binary(app)

    await run(binaryApp, process.argv)
  } catch (error) {
    if (error instanceof DomainError) {
      logger.error({ context: error.context }, error.message)
    } else {
      logger.fatal(error.stack ?? error.message)
    }
  }
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
