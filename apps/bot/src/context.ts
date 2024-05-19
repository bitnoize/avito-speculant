import { Context } from 'grammy'
import { User, Subscription, Plan } from '@avito-speculant/database'

export type BotContext = Context & {
  user: User
  subscription: Subscription | undefined
  plan: Plan | undefined
}
