import { subcommands } from 'cmd-ts'
import usersCacheFetchCommand from './users-cache-fetch.command.js'
import plansCacheFetchCommand from './plans-cache-fetch.command.js'
import userSubscriptionsCacheFetchCommand from './user-subscriptions-cache-fetch.command.js'
import userBotsCacheFetchCommand from './user-bots-cache-fetch.command.js'
import userCategoriesCacheFetchCommand from './user-categories-cache-fetch.command.js'
import scraperCategoriesCacheFetchCommand from './scraper-categories-cache-fetch.command.js'
import proxiesCacheFetchCommand from './proxies-cache-fetch.command.js'
import onlineProxiesCacheFetchCommand from './online-proxies-cache-fetch.command.js'
import scrapersCacheFetchCommand from './scrapers-cache-fetch.command.js'
import { InitSubcommands } from '../manager.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'redis',
    description: 'redis commands',
    cmds: {
      'users-cache-fetch': usersCacheFetchCommand(config, logger),
      'plans-cache-fetch': plansCacheFetchCommand(config, logger),
      'user-subscriptions-cache-fetch': userSubscriptionsCacheFetchCommand(config, logger),
      'user-bots-cache-fetch': userBotsCacheFetchCommand(config, logger),
      'user-categories-cache-fetch': userCategoriesCacheFetchCommand(config, logger),
      'scraper-categories-cache-fetch': scraperCategoriesCacheFetchCommand(config, logger),
      'proxies-cache-fetch': proxiesCacheFetchCommand(config, logger),
      'online-proxies-cache-fetch': onlineProxiesCacheFetchCommand(config, logger),
      'scrapers-cache-fetch': scrapersCacheFetchCommand(config, logger)
    }
  })
}

export default initSubcommands
