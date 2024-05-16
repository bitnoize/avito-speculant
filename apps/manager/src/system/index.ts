import { subcommands } from 'cmd-ts'
import startCommand from './start.command.js'
import stopCommand from './stop.command.js'
import { InitSubcommands } from '../manager.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'system',
    description: 'system commands',
    cmds: {
      start: startCommand(config, logger),
      stop: stopCommand(config, logger)
    }
  })
}

export default initSubcommands
