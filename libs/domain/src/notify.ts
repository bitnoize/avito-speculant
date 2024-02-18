export const CHANNELS = ['user', 'plan', 'subscription', 'category']
export type Channel = (typeof CHANNELS)[number]

export type Notify = [Channel, string, number, string]
