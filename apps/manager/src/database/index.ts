import { subcommands } from 'cmd-ts'
import migrationsCommand from './migrations.command.js'
import userLogsListCommand from './user-logs-list.command.js'
import planCreateCommand from './plan-create.command.js'
import planUpdatePriceCommand from './plan-update-price.command.js'
import planEnableCommand from './plan-enable.command.js'
import planDisableCommand from './plan-disable.command.js'
import planLogsListCommand from './plan-logs-list.command.js'
import subscriptionCreateCommand from './subscription-create.command.js'
import subscriptionActivateCommand from './subscription-activate.command.js'
import subscriptionCancelCommand from './subscription-cancel.command.js'
import subscriptionLogsListCommand from './subscription-logs-list.command.js'
import botCreateCommand from './bot-create.command.js'
import botEnableCommand from './bot-enable.command.js'
import botDisableCommand from './bot-disable.command.js'
import botLogsListCommand from './bot-logs-list.command.js'
import categoryCreateCommand from './category-create.command.js'
import categoryEnableCommand from './category-enable.command.js'
import categoryDisableCommand from './category-disable.command.js'
import categoryLogsListCommand from './category-logs-list.command.js'
import proxyCreateCommand from './proxy-create.command.js'
import proxyEnableCommand from './proxy-enable.command.js'
import proxyDisableCommand from './proxy-disable.command.js'
import proxyLogsListCommand from './proxy-logs-list.command.js'
import { InitSubcommands } from '../manager.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'database',
    description: `database commands`,
    cmds: {
      migrations: migrationsCommand(config, logger),
      'user-logs-list': userLogsListCommand(config, logger),
      'plan-create': planCreateCommand(config, logger),
      'plan-update-price': planUpdatePriceCommand(config, logger),
      'plan-enable': planEnableCommand(config, logger),
      'plan-disable': planDisableCommand(config, logger),
      'plan-logs-list': planLogsListCommand(config, logger),
      'bot-create': botCreateCommand(config, logger),
      'bot-enable': botEnableCommand(config, logger),
      'bot-disable': botDisableCommand(config, logger),
      'bot-logs-list': botLogsListCommand(config, logger),
      'subscription-create': subscriptionCreateCommand(config, logger),
      'subscription-activate': subscriptionActivateCommand(config, logger),
      'subscription-cancel': subscriptionCancelCommand(config, logger),
      'subscription-logs-list': subscriptionLogsListCommand(config, logger),
      'category-create': categoryCreateCommand(config, logger),
      'category-enable': categoryEnableCommand(config, logger),
      'category-disable': categoryDisableCommand(config, logger),
      'category-logs-list': categoryLogsListCommand(config, logger),
      'proxy-create': proxyCreateCommand(config, logger),
      'proxy-enable': proxyEnableCommand(config, logger),
      'proxy-disable': proxyDisableCommand(config, logger),
      'proxy-logs-list': proxyLogsListCommand(config, logger)
    }
  })
}

export default initSubcommands
