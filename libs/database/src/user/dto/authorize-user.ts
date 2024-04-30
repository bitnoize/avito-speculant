import { Notify } from '@avito-speculant/common'
import { User } from '../user.js'
import { UserLogData } from '../../user-log/user-log.js'
import { Plan } from '../../plan/plan.js'
import { Subscription } from '../../subscription/subscription.js'
import { DatabaseMethod } from '../../database.js'

export type AuthorizeUserRequest = {
  tgFromId: string
  data: UserLogData
}

export type AuthorizeUserResponse = {
  user: User
  subscription: Subscription | undefined
  plan: Plan | undefined
  backLog: Notify[]
}

export type AuthorizeUser = DatabaseMethod<AuthorizeUserRequest, AuthorizeUserResponse>
