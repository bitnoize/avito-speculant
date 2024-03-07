import { Context, SessionFlavor } from 'grammy'
import { User } from '@avito-speculant/database'

export type BotContext = Context & {
  user: User
}
