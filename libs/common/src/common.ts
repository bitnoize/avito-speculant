export const ENTITIES = ['user', 'plan', 'subscription', 'bot', 'category', 'proxy']
export type Entity = (typeof ENTITIES)[number]

export type Notify = [Entity, string, number, string]

export type ErrorContext = Record<string, unknown>
