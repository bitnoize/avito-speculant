export const ENTITIES = ['user', 'plan', 'subscription', 'category', 'proxy', 'bot']
export type Entity = (typeof ENTITIES)[number]

export type Notify = [Entity, string, number, string]

export type ErrorContext = Record<string, unknown>
