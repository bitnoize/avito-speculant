import { subcommands } from 'cmd-ts'
import heartbeatSummaryCommand from './heartbeat-summary.command.js'
import treatmentSummaryCommand from './treatment-summary.command.js'
import scrapingSummaryCommand from './scraping-summary.command.js'
import scrapingCleanupCommand from './scraping-cleanup.command.js'
import checkproxySummaryCommand from './checkproxy-summary.command.js'
import broadcastSummaryCommand from './broadcast-summary.command.js'
import throttleSummaryCommand from './throttle-summary.command.js'
import sendreportSummaryCommand from './sendreport-summary.command.js'
import { InitSubcommands } from '../manager.js'

const initSubcommands: InitSubcommands = (config, logger) => {
  return subcommands({
    name: 'queue',
    cmds: {
      'heartbeat-summary': heartbeatSummaryCommand(config, logger),
      'treatment-summary': treatmentSummaryCommand(config, logger),
      'scraping-summary': scrapingSummaryCommand(config, logger),
      'scraping-cleanup': scrapingCleanupCommand(config, logger),
      'checkproxy-summary': checkproxySummaryCommand(config, logger),
      'broadcast-summary': broadcastSummaryCommand(config, logger),
      'throttle-summary': throttleSummaryCommand(config, logger),
      'sendreport-summary': sendreportSummaryCommand(config, logger)
    }
  })
}

export default initSubcommands
