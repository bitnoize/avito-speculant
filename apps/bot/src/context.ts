import { Context, SessionFlavor } from 'grammy'
import { User, Subscription } from '@avito-speculant/database'

export type BotContext = Context & {
  user: User
  subscription?: Subscription
}
