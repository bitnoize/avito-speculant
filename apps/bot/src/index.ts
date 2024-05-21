import Fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import { Bot, GrammyError, HttpError, session, webhookCallback } from 'grammy'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { DomainError } from '@avito-speculant/common'
import {
  CreateUserRequest,
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
  scraperCacheService,
} from '@avito-speculant/redis'
import { queueService, treatmentService } from '@avito-speculant/queue'
import {
  Config,
  ApiGetUser,
  ApiGetPlan,
  ApiGetPlans,
  ApiGetSubscription,
  ApiPostSubscription,
  ApiPutSubscriptionCancel,
  ApiGetSubscriptions,
  ApiGetBot,
  ApiPostBot,
  ApiPutBotEnable,
  ApiPutBotDisable,
  ApiGetBots,
  ApiGetCategory,
  ApiPostCategory,
  ApiPutCategoryEnable,
  ApiPutCategoryDisable,
  ApiGetCategories,
  ApiGetScraper,
} from './bot.js'
import { configSchema } from './bot.schema.js'
import {
  ApiUnauthorizedError, 
  ApiNotFoundError,
  ApiForbiddenError,
} from './bot.errors.js'
import {
  userCacheToData,
  userToData,
  planCacheToData,
  planToData,
  subscriptionCacheToData,
  subscriptionToData,
  botCacheToData,
  botToData,
  categoryCacheToData,
  categoryToData,
  scraperCacheToData
} from './bot.utils.js'
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
    if (!(ctx.from !== undefined && !ctx.from.is_bot)) {
      return
    }

    const tgFromId = ctx.from.id.toString()

    const { userId } = await userCacheService.fetchTelegramUserLink(redis, {
      tgFromId
    })

    if (userId !== undefined) {
      ctx.userId = userId
    } else {
      const { user, backLog } = await userService.createUser(db, {
        tgFromId,
        data: {
          from: ctx.from,
          message: `Create user via Bot`
        }
      })

      ctx.userId = user.id

      await treatmentService.addJob(treatmentQueue, 'user', user.id)

      await redisService.publishBackLog(pubSub, backLog)
    }

    await next()
  })

  bot.command('start', async (ctx) => {
    const session = redisService.randomHash()
    userCacheService.saveWebappUserLink(redis, { session, userId: ctx.userId })

    await ctx.reply(`Session: ${session}`)
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
      const session = request.headers['authorization']

      if (!(session !== undefined && session !== '')) {
        throw new ApiUnauthorizedError()
      }

      const { userId } = await userCacheService.fetchWebappUserLink(redis, {
        session
      })

      if (userId === undefined) {
        throw new ApiUnauthorizedError()
      }

      request.userId = userId
    }
  )

  //
  // Api User
  //

  api.get<ApiGetUser>(
    '/v1/user',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { userCache } = await userCacheService.fetchUserCache(redis, {
        userId: request.userId
      })

      reply.code(200).send({
        ok: true,
        data: userCacheToData(userCache)
      })
    }
  )

  //
  // Api Plan
  //

  api.get<ApiGetPlan>(
    '/v1/plan/:planId',
    {
      schema: {
        params: {
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

      const { planCache } = await planCacheService.fetchPlanCache(redis, {
        planId: request.params.planId
      })

      reply.code(200).send({
        ok: true,
        data: planCacheToData(planCache),
      })
    }
  )

  api.get<ApiGetPlans>(
    '/v1/plans',
    async (request, reply) => {
      if (request.userId === undefined) {
        throw new Error('Authorize lost')
      }

      const { plansCache } = await planCacheService.fetchPlansCache(redis)

      reply.code(200).send({
        ok: true,
        data: plansCache.map((planCache) => planCacheToData(planCache))
      })
    }
  )

  //
  // Api Subscription
  //

  api.get<ApiGetSubscription>(
    '/v1/subscription/:subscriptionId',
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

      const {
        subscriptionCache
      } = await subscriptionCacheService.fetchUserSubscriptionCache(redis, {
        userId: request.userId,
        subscriptionId: request.params.subscriptionId
      })

      reply.code(200).send({
        ok: true,
        data: subscriptionCacheToData(subscriptionCache),
      })
    }
  )

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
        data: subscriptionToData(subscription)
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
        data: subscriptionToData(subscription)
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
        data: subscriptionsCache.map(
          (subscriptionCache) => subscriptionCacheToData(subscriptionCache)
        )
      })
    }
  )

  //
  // Api Bot
  //

  api.get<ApiGetBot>(
    '/v1/bot/:botId',
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

      const { botCache } = await botCacheService.fetchUserBotCache(redis, {
        userId: request.userId,
        botId: request.params.botId
      })

      reply.code(200).send({
        ok: true,
        data: botCacheToData(botCache),
      })
    }
  )

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
        data: botToData(bot),
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
        data: botToData(bot),
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
        data: botToData(bot),
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
        data: botsCache.map((botCache) => botCacheToData(botCache))
      })
    }
  )

  //
  // Api Category
  //

  api.get<ApiGetCategory>(
    '/v1/category/:categoryId',
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

      const { categoryCache } = await categoryCacheService.fetchUserCategoryCache(redis, {
        userId: request.userId,
        categoryId: request.params.categoryId
      })

      reply.code(200).send({
        ok: true,
        data: categoryCacheToData(categoryCache),
      })
    }
  )

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
        data: categoryToData(category)
      })
    }
  )

  api.put<ApiPutCategoryEnable>(
    '/v1/category/:categoryId/enable',
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
        },
        body: {
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

      const { user, category, backLog } = await categoryService.enableCategory(db, {
        userId: request.userId,
        categoryId: request.params.categoryId,
        botId: request.body.botId,
        data: {}
      })

      await redisService.publishBackLog(pubSub, backLog)

      await treatmentService.addJob(treatmentQueue, 'user', user.id)
      await treatmentService.addJob(treatmentQueue, 'category', category.id)

      reply.code(200).send({
        ok: true,
        data: categoryToData(category)
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
        data: categoryToData(category)
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
        data: categoriesCache.map((categoryCache) => categoryCacheToData(categoryCache))
      })
    }
  )

  //
  // Api Scraper
  //

  api.get<ApiGetScraper>(
    '/v1/scraper/:scraperId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['scraperId'],
          properties: {
            'scraperId': {
              type: 'string',
              minLength: 1,
              maxLength: 100
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

      const { scraperCache } = await scraperCacheService.fetchScraperCache(redis, {
        scraperId: request.params.scraperId
      })

      reply.code(200).send({
        ok: true,
        data: scraperCacheToData(scraperCache),
      })
    }
  )

  //api.post(`/${bot.token}`, webhookCallback(bot, 'fastify'))

  await api.listen({ port: 3000, host: '0.0.0.0' })
}

bootstrap()
