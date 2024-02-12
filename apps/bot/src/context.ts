import { Context, SessionFlavor } from 'grammy'
import { User } from '@avito-speculant/domain'

export type BotContext = Context & {
  user: User
}
