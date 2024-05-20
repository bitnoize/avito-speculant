import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import { Bot, GrammyError, HttpError, session, webhookCallback } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  AuthorizeUserRequest,
  databaseService,
  userService,
  subscriptionService,
  botService,
  categoryService,
} from '@avito-speculant/database'
import {
  redisService,
  userCacheService,
  planCacheService,
  subscriptionCacheService,
  botCacheService,
  categoryCacheService,
} from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import {
  Config,
  ApiGetPlans,
  ApiPostSubscription,
  ApiPutSubscriptionCancel,
  ApiGetSubscriptions,
  ApiPostBot,
  ApiPutBotEnableDisable,
  ApiGetBots,
  ApiGetCategories,
} from './bot.js'
import { configSchema } from './bot.schema.js'
import { UnauthorizedError } from './bot.errors.js'
import { BotContext } from './context.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const queueConnection = queueService.getQueueConnection<Config>(config)
  const treatmentQueue = treatmentService.initQueue(queueConnection, logger)

  //
  // Bot
  //

  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const { user, subscription, backLog } = await userService.authorizeUser(db, {
        tgFromId: ctx.from.id.toString(),
        data: {
          from: ctx.from,
          message: `Authorize user via Bot`
        }
      })

      ctx.user = user

      if (user.activeSubscriptionId !== null) {
        if (subscription === undefined) {
          throw new Error(`subscription lost`)
        }

        ctx.subscription = subscription
      }

      await redisService.publishBackLog(pubSub, backLog)

      await next()
    }
  })

  bot.command('start', async (ctx) => {
    const { user, subscription } = ctx

    const token = redisService.randomHash()
    userCacheService.saveWebappUserLink(redis, { token, userId: user.id })

    await ctx.reply(
      `Подписка активирована: ${ctx.user.activeSubscriptionId ? 'да' : 'нет'}\n` +
      `Токен приложения: ${token}`
    )
  })

  bot.catch(async (botError) => {
    const { error, ctx } = botError

    if (error instanceof GrammyError) {
      logger.error(error, `Bot Grammy error`)
    } else if (error instanceof HttpError) {
      logger.error(error, `Bot HTTP error`)
    } else if (error instanceof DomainError) {
      logger.error(error.context, error.message)
    } else {
      logger.error(error, `Bot internal error`)
    }
  })

  bot.start()

  //
  // Api
  //

  const api = Fastify({ logger })

  api.setErrorHandler(async (error, request, reply) => {
    request.log.error(error.message)

    await reply.status(error.statusCode ?? 500).send({
      ok: false,
      reason: error.message
    })
  })

  api.addHook(
    'onRequest',
    async (request, reply) => {
      const token = request.headers['authorization']

      if (!(token !== undefined && token !== '')) {
        throw new UnauthorizedError()
      }

      const userId = await userCacheService.fetchWebappUserLink(redis, {
        token
      })

      if (userId === undefined) {
        throw new UnauthorizedError()
      }

      request.userId = userId
    }
  )

  api.get<ApiGetPlans>(
    '/plans',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { plansCache } = await planCacheService.fetchPlansCache(redis)

      reply.code(200).send({
        ok: true,
        data: plansCache.map((planCache) => ({
          planId: planCache.id,
          categoriesMax: planCache.categoriesMax,
          durationDays: planCache.durationDays,
          intervalSec: planCache.intervalSec,
          analyticsOn: planCache.analyticsOn,
          priceRub: planCache.priceRub,
          isEnabled: planCache.isEnabled
        }))
      })
    }
  )

  api.post<ApiPostSubscription>(
    '/subscription',
    {
      schema: {
        body: {
          type: 'object',
          required: ['planId'],
          properties: {
            'planId': {
              type: 'integer'
            }
          },
          additionalProperties: false
        }
      }
    },
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { subscription, backLog } = await subscriptionService.createSubscription(db, {
        userId: request.userId,
        planId: request.body.planId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'subscription', subscription.id)

      reply.code(201).send({
        ok: true,
        data: {
          subscriptionId: subscription.id,
          planId: subscription.planId,
          priceRub: subscription.priceRub,
          status: subscription.status,
          createdAt: subscription.createdAt,
          timeoutAt: subscription.timeoutAt,
          finishAt: subscription.finishAt
        }
      })
    }
  )

  api.put<ApiPutSubscriptionCancel>(
    '/subscription/:subscriptionId/cancel',
    {
      schema: {
        params: {
          type: 'object',
          required: ['subscriptionId'],
          properties: {
            'subscriptionId': {
              type: 'integer'
            }
          },
          additionalProperties: false
        }
      }
    },
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { subscription, backLog } = await subscriptionService.cancelSubscription(db, {
        userId: request.userId,
        subscriptionId: request.params.subscriptionId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'subscription', subscription.id)

      reply.code(200).send({
        ok: true,
        data: {
          subscriptionId: subscription.id,
          planId: subscription.planId,
          priceRub: subscription.priceRub,
          status: subscription.status,
          createdAt: subscription.createdAt,
          timeoutAt: subscription.timeoutAt,
          finishAt: subscription.finishAt
        }
      })
    }
  )

  api.get<ApiGetSubscriptions>(
    '/subscriptions',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { userCache } = await userCacheService.fetchUserCache(redis, {
        userId: request.userId
      })

      const {
        subscriptionsCache
      } = await subscriptionCacheService.fetchUserSubscriptionsCache(redis, {
        userId: userCache.id
      })

      reply.code(200).send({
        ok: true,
        data: subscriptionsCache.map((subscriptionCache) => ({
          subscriptionId: subscriptionCache.id,
          planId: subscriptionCache.planId,
          priceRub: subscriptionCache.priceRub,
          status: subscriptionCache.status,
          createdAt: subscriptionCache.createdAt,
          timeoutAt: subscriptionCache.timeoutAt,
          finishAt: subscriptionCache.finishAt
        }))
      })
    }
  )

  api.post<ApiPostBot>(
    '/bot',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            'token': {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      }
    },
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { bot, backLog } = await botService.createBot(db, {
        userId: request.userId,
        token: request.body.token,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'bot', bot.id)

      reply.code(201).send({
        ok: true,
        data: {
          botId: bot.id,
          token: bot.token,
          isLinked: bot.isLinked,
          isEnabled: bot.isEnabled,
          isOnline: null,
          tgFromId: null,
          username: null,
          totalCount: null,
          successCount: null,
          createdAt: bot.createdAt
        }
      })
    }
  )

  api.put<ApiPutBotEnableDisable>(
    '/bot/:botId/:action',
    {
      schema: {
        params: {
          type: 'object',
          required: ['botId', 'action'],
          properties: {
            'botId': {
              type: 'integer'
            },
            'action': {
              enum: ['enable', 'disable']
            }
          },
          additionalProperties: false
        }
      }
    },
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      if (request.params.action === 'enable') {
        const { user, bot, backLog } = await botService.enableBot(db, {
          userId: request.userId,
          botId: request.params.botId,
          data: {}
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'user', user.id)
        await treatmentService.addJob(treatmentQueue, 'bot', bot.id)

        reply.code(200).send({
          ok: true,
          data: {
            botId: bot.id,
            token: bot.token,
            isLinked: bot.isLinked,
            isEnabled: bot.isEnabled,
            isOnline: null,
            tgFromId: null,
            username: null,
            totalCount: null,
            successCount: null,
            createdAt: bot.createdAt
          }
        })
      } else if (request.params.action === 'disable') {
        const { user, bot, backLog } = await botService.disableBot(db, {
          userId: request.userId,
          botId: request.params.botId,
          data: {}
        })

        await redisService.publishBackLog(pubSub, backLog)

        await treatmentService.addJob(treatmentQueue, 'user', user.id)
        await treatmentService.addJob(treatmentQueue, 'bot', bot.id)

        reply.code(200).send({
          ok: true,
          data: {
            botId: bot.id,
            token: bot.token,
            isLinked: bot.isLinked,
            isEnabled: bot.isEnabled,
            isOnline: null,
            tgFromId: null,
            username: null,
            totalCount: null,
            successCount: null,
            createdAt: bot.createdAt
          }
        })
      }
    }
  )

  api.get<ApiGetBots>(
    '/bots',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { userCache } = await userCacheService.fetchUserCache(redis, {
        userId: request.userId
      })

      const { botsCache } = await botCacheService.fetchUserBotsCache(redis, {
        userId: userCache.id
      })

      reply.code(200).send({
        ok: true,
        data: botsCache.map((botCache) => ({
          botId: botCache.id,
          token: botCache.token,
          isLinked: botCache.isLinked,
          isEnabled: botCache.isEnabled,
          isOnline: botCache.isOnline,
          tgFromId: botCache.tgFromId,
          username: botCache.username,
          totalCount: botCache.totalCount,
          successCount: botCache.successCount,
          createdAt: botCache.createdAt
        }))
      })
    }
  )

  api.get<ApiGetCategories>(
    '/categories',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { userCache } = await userCacheService.fetchUserCache(redis, {
        userId: request.userId
      })

      const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
        userId: userCache.id
      })

      reply.code(200).send({
        ok: true,
        data: categoriesCache.map((categoryCache) => ({
          categoryId: categoryCache.id,
          urlPath: categoryCache.urlPath,
          botId: categoryCache.botId,
          scraperId: categoryCache.scraperId,
          isEnabled: categoryCache.isEnabled,
          createdAt: categoryCache.createdAt,
          reportedAt: categoryCache.reportedAt,
        }))
      })
    }
  )

  /*
  api.post<{
    Body: ApiPostSubscriptionBody,
    Reply: ApiPostSubscriptionReply
  }>(
    '/plans',
    {
      schema: {
        body: {
          type: 'object',
          required: ['planId'],
          properties: {
            'planId': {
              type: 'integer'
            }
          },
          additionalProperties: false
        }
      }
    },
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const userCache = await userCacheService.fetchUserCache(redis, {
        userId: request.userId
      })

      //const { plansCache } = await planCacheService.fetchPlansCache(redis)

      reply.code(200).send({
        ok: true,
        plans: plansCache.map((planCache) => ({
          id: planCache.id,
          categoriesMax: planCache.categoriesMax,
          durationDays: planCache.durationDays,
          intervalSec: planCache.intervalSec,
          analyticsOn: planCache.analyticsOn,
          priceRub: planCache.priceRub,
          isEnabled: planCache.isEnabled
        }))
      })
    }
  )

*/

  //api.post(`/${bot.token}`, webhookCallback(bot, 'fastify'))

  await api.listen({ port: 3000 })
}

bootstrap()
