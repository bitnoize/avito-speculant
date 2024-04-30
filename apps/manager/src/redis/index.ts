import { subcommands } from 'cmd-ts'
import fetchUsersCacheCommand from './fetch-users-cache.command.js'
import fetchPlansCacheCommand from './fetch-plans-cache.command.js'
import fetchUserSubscriptionCacheCommand from './fetch-user-subscription-cache.command.js'
import fetchPlanSubscriptionsCacheCommand from './fetch-plan-subscriptions-cache.command.js'
import fetchUserCategoriesCacheCommand from './fetch-user-categories-cache.command.js'
import fetchScraperCategoriesCacheCommand from './fetch-scraper-categories-cache.command.js'
import fetchProxiesCacheCommand from './fetch-proxies-cache.command.js'
import fetchOnlineProxiesCacheCommand from './fetch-online-proxies-cache.command.js'
import fetchScrapersCacheCommand from './fetch-scrapers-cache.command.js'
import fetchScraperAdvertsCacheCommand from './fetch-scraper-adverts-cache.command.js'
import { InitSubcommands } from '../manager.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'redis',
    description: 'redis commands',
    cmds: {
      'fetch-users-cache': fetchUsersCacheCommand(config, logger),
      'fetch-plans-cache': fetchPlansCacheCommand(config, logger),
      'fetch-user-subscription-cache': fetchUserSubscriptionCacheCommand(config, logger),
      'fetch-plan-subscriptions-cache': fetchPlanSubscriptionsCacheCommand(config, logger),
      'fetch-user-categories-cache': fetchUserCategoriesCacheCommand(config, logger),
      'fetch-scraper-categories-cache': fetchScraperCategoriesCacheCommand(config, logger),
      'fetch-proxies-cache': fetchProxiesCacheCommand(config, logger),
      'fetch-online-proxies-cache': fetchOnlineProxiesCacheCommand(config, logger),
      'fetch-scrapers-cache': fetchScrapersCacheCommand(config, logger),
      'fetch-scraper-adverts-cache': fetchScraperAdvertsCacheCommand(config, logger)
    }
  })
}

export default initSubcommands
