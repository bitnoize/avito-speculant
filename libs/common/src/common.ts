export const ENTITIES = ['user', 'plan', 'subscription', 'category', 'proxy']
export type Entity = (typeof ENTITIES)[number]

export type Notify = [Entity, string, number, string]
