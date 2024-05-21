import { Context } from 'grammy'

export type BotContext = Context & {
  userId: number
}
