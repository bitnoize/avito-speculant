import {
  UserCache,
  PlanCache,
  SubscriptionCache,
  BotCache,
  CategoryCache,
  ScraperCache
} from '@avito-speculant/redis'
import {
  User,
  Plan,
  Subscription,
  Bot,
  Category
} from '@avito-speculant/database'
import {
  UserData,
  PlanData,
  SubscriptionData,
  BotData,
  CategoryData,
  ScraperData
} from './bot.js'

export const userCacheToData = (userCache: UserCache): UserData => {
  return {
    userId: userCache.id,
    tgFromId: userCache.tgFromId,
    activeSubscriptionId: userCache.activeSubscriptionId,
    subscriptions: userCache.subscriptions,
    categories: userCache.categories,
    bots: userCache.bots,
    createdAt: userCache.createdAt,
    updatedAt: userCache.updatedAt
  }
}

export const userToData = (user: User): UserData => {
  return {
    userId: user.id,
    tgFromId: user.tgFromId,
    activeSubscriptionId: user.activeSubscriptionId,
    subscriptions: user.subscriptions,
    categories: user.categories,
    bots: user.bots,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

export const planCacheToData = (planCache: PlanCache): PlanData => {
  return {
    planId: planCache.id,
    categoriesMax: planCache.categoriesMax,
    durationDays: planCache.durationDays,
    intervalSec: planCache.intervalSec,
    analyticsOn: planCache.analyticsOn,
    priceRub: planCache.priceRub,
    isEnabled: planCache.isEnabled
  }
}

export const planToData = (plan: Plan): PlanData => {
  return {
    planId: plan.id,
    categoriesMax: plan.categoriesMax,
    durationDays: plan.durationDays,
    intervalSec: plan.intervalSec,
    analyticsOn: plan.analyticsOn,
    priceRub: plan.priceRub,
    isEnabled: plan.isEnabled
  }
}

export const subscriptionCacheToData = (
  subscriptionCache: SubscriptionCache
): SubscriptionData => {
  return {
    subscriptionId: subscriptionCache.id,
    planId: subscriptionCache.planId,
    priceRub: subscriptionCache.priceRub,
    status: subscriptionCache.status,
    createdAt: subscriptionCache.createdAt,
    updatedAt: subscriptionCache.updatedAt,
    timeoutAt: subscriptionCache.timeoutAt,
    finishAt: subscriptionCache.finishAt
  }
}

export const subscriptionToData = (subscription: Subscription): SubscriptionData => {
  return {
    subscriptionId: subscription.id,
    planId: subscription.planId,
    priceRub: subscription.priceRub,
    status: subscription.status,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
    timeoutAt: subscription.timeoutAt,
    finishAt: subscription.finishAt
  }
}

export const botCacheToData = (botCache: BotCache): BotData => {
  return {
    botId: botCache.id,
    token: botCache.token,
    isLinked: botCache.isLinked,
    isEnabled: botCache.isEnabled,
    isOnline: botCache.isOnline,
    tgFromId: botCache.tgFromId,
    username: botCache.username,
    totalCount: botCache.totalCount,
    successCount: botCache.successCount,
    createdAt: botCache.createdAt,
    updatedAt: botCache.updatedAt
  }
}

export const botToData = (bot: Bot): BotData => {
  return {
    botId: bot.id,
    token: bot.token,
    isLinked: bot.isLinked,
    isEnabled: bot.isEnabled,
    createdAt: bot.createdAt,
    updatedAt: bot.updatedAt
  }
}

export const categoryCacheToData = (categoryCache: CategoryCache): CategoryData => {
  return {
    categoryId: categoryCache.id,
    urlPath: categoryCache.urlPath,
    botId: categoryCache.botId,
    scraperId: categoryCache.scraperId,
    isEnabled: categoryCache.isEnabled,
    createdAt: categoryCache.createdAt,
    updatedAt: categoryCache.updatedAt,
    reportedAt: categoryCache.reportedAt,
  }
}

export const categoryToData = (category: Category): CategoryData => {
  return {
    categoryId: category.id,
    urlPath: category.urlPath,
    botId: category.botId,
    isEnabled: category.isEnabled,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }
}

export const scraperCacheToData = (scraperCache: ScraperCache): ScraperData => {
  return {
    scraperId: scraperCache.id,
    urlPath: scraperCache.urlPath,
    totalCount: scraperCache.totalCount,
    successCount: scraperCache.successCount
  }
}
