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
  ApiPutBotEnable,
  ApiPutBotDisable,
  ApiGetBots,
  ApiPostCategory,
  ApiPutCategoryEnable,
  ApiPutCategoryDisable,
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

  //
  // Api Plan
  //

  api.get<ApiGetPlans>(
    '/v1/plans',
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

  //
  // Api Subscription
  //

  api.post<ApiPostSubscription>(
    '/v1/subscription',
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
    '/v1/subscription/:subscriptionId/cancel',
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
    '/v1/subscriptions',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const {
        subscriptionsCache
      } = await subscriptionCacheService.fetchUserSubscriptionsCache(redis, {
        userId: request.userId
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

  //
  // Api Bot
  //

  api.post<ApiPostBot>(
    '/v1/bot',
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
          createdAt: bot.createdAt
        }
      })
    }
  )

  api.put<ApiPutBotEnable>(
    '/v1/bot/:botId/enable',
    {
      schema: {
        params: {
          type: 'object',
          required: ['botId'],
          properties: {
            'botId': {
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
          createdAt: bot.createdAt
        }
      })
    }
  )

  api.put<ApiPutBotDisable>(
    '/v1/bot/:botId/disable',
    {
      schema: {
        params: {
          type: 'object',
          required: ['botId'],
          properties: {
            'botId': {
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
          createdAt: bot.createdAt
        }
      })
    }
  )

  api.get<ApiGetBots>(
    '/v1/bots',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { botsCache } = await botCacheService.fetchUserBotsCache(redis, {
        userId: request.userId
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

  //
  // Api Category
  //

  api.post<ApiPostCategory>(
    '/v1/category',
    {
      schema: {
        body: {
          type: 'object',
          required: ['urlPath'],
          properties: {
            'urlPath': {
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

      const { category, backLog } = await categoryService.createCategory(db, {
        userId: request.userId,
        urlPath: request.body.urlPath,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'category', category.id)

      reply.code(201).send({
        ok: true,
        data: {
          categoryId: category.id,
          urlPath: category.urlPath,
          botId: category.botId,
          isEnabled: category.isEnabled,
          createdAt: category.createdAt,
        }
      })
    }
  )

  api.put<ApiPutCategoryEnable>(
    '/v1/category/:categoryId/enable',
    {
      schema: {
        params: {
          type: 'object',
          required: ['categoryId', 'botId'],
          properties: {
            'categoryId': {
              type: 'integer'
            },
            'botId': {
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

      const { user, category, backLog } = await categoryService.enableCategory(db, {
        userId: request.userId,
        categoryId: request.params.categoryId,
        botId: request.params.botId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'user', user.id)
      await treatmentService.addJob(treatmentQueue, 'category', category.id)

      reply.code(200).send({
        ok: true,
        data: {
          categoryId: category.id,
          urlPath: category.urlPath,
          botId: category.botId,
          isEnabled: category.isEnabled,
          createdAt: category.createdAt,
        }
      })
    }
  )

  api.put<ApiPutCategoryDisable>(
    '/v1/category/:categoryId/disable',
    {
      schema: {
        params: {
          type: 'object',
          required: ['categoryId'],
          properties: {
            'categoryId': {
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

      const { user, category, backLog } = await categoryService.disableCategory(db, {
        userId: request.userId,
        categoryId: request.params.categoryId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'user', user.id)
      await treatmentService.addJob(treatmentQueue, 'category', category.id)

      reply.code(200).send({
        ok: true,
        data: {
          categoryId: category.id,
          urlPath: category.urlPath,
          botId: category.botId,
          isEnabled: category.isEnabled,
          createdAt: category.createdAt,
        }
      })
    }
  )

  api.get<ApiGetCategories>(
    '/v1/categories',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { categoriesCache } = await categoryCacheService.fetchUserCategoriesCache(redis, {
        userId: request.userId
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

  //api.post(`/${bot.token}`, webhookCallback(bot, 'fastify'))

  await api.listen({ port: 3000 })
}

bootstrap()
