import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_QUEUE_REDIS_HOST,
  DEFAULT_QUEUE_REDIS_PORT,
  DEFAULT_QUEUE_REDIS_DATABASE,
  DEFAULT_SCRAPING_CONCURRENCY,
  DEFAULT_SCRAPING_LIMITER_MAX,
  DEFAULT_SCRAPING_LIMITER_DURATION,
  DEFAULT_SCRAPING_REQUEST_VERBOSE
} from '@avito-speculant/queue'
import { Config, AvitoData } from './worker-scraping.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'SCRAPING_CONCURRENCY',
    'SCRAPING_LIMITER_MAX',
    'SCRAPING_LIMITER_DURATION',
    'SCRAPING_REQUEST_VERBOSE'
  ],
  properties: {
    LOG_LEVEL: {
      type: 'string',
      default: DEFAULT_LOG_LEVEL
    },
    REDIS_HOST: {
      type: 'string',
      default: DEFAULT_REDIS_HOST
    },
    REDIS_PORT: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      default: DEFAULT_REDIS_PORT
    },
    REDIS_DATABASE: {
      type: 'integer',
      minimum: 0,
      maximum: 15,
      default: DEFAULT_REDIS_DATABASE
    },
    REDIS_USERNAME: {
      type: 'string',
      nullable: true
    },
    REDIS_PASSWORD: {
      type: 'string',
      nullable: true
    },
    QUEUE_REDIS_HOST: {
      type: 'string',
      default: DEFAULT_QUEUE_REDIS_HOST
    },
    QUEUE_REDIS_PORT: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      default: DEFAULT_QUEUE_REDIS_PORT
    },
    QUEUE_REDIS_DATABASE: {
      type: 'integer',
      minimum: 0,
      maximum: 15,
      default: DEFAULT_QUEUE_REDIS_DATABASE
    },
    QUEUE_REDIS_USERNAME: {
      type: 'string',
      nullable: true
    },
    QUEUE_REDIS_PASSWORD: {
      type: 'string',
      nullable: true
    },
    SCRAPING_CONCURRENCY: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_SCRAPING_CONCURRENCY
    },
    SCRAPING_LIMITER_MAX: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      default: DEFAULT_SCRAPING_LIMITER_MAX
    },
    SCRAPING_LIMITER_DURATION: {
      type: 'integer',
      minimum: 1000,
      maximum: 60000,
      default: DEFAULT_SCRAPING_LIMITER_DURATION
    },
    SCRAPING_REQUEST_VERBOSE: {
      type: 'boolean',
      default: DEFAULT_SCRAPING_REQUEST_VERBOSE
    },
  }
}

export const avitoDataSchema: JSONSchemaType<AvitoData> = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['catalog'],
      properties: {
        catalog: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'id',
                  'title',
                  'description',
                  'sortTimeStamp',
                  'urlPath',
                  'priceDetailed',
                  'images',
                  'iva'
                ],
                properties: {
                  id: {
                    type: 'integer'
                  },
                  title: {
                    type: 'string'
                  },
                  description: {
                    type: 'string'
                  },
                  sortTimeStamp: {
                    type: 'integer'
                  },
                  urlPath: {
                    type: 'string'
                  },
                  priceDetailed: {
                    type: 'object',
                    required: [
                      'value'
                    ],
                    properties: {
                      value: {
                        type: 'integer'
                      }
                    },
                  },
                  images: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        '208x156',
                        '236x177',
                        '318x238',
                        '416x312',
                        '432x324',
                        '472x354',
                        '636x476',
                        '864x648',
                      ],
                      properties: {
                        '208x156': {
                          type: 'string'
                        },
                        '236x177': {
                          type: 'string'
                        },
                        '318x238': {
                          type: 'string'
                        },
                        '416x312': {
                          type: 'string'
                        },
                        '432x324': {
                          type: 'string'
                        },
                        '472x354': {
                          type: 'string'
                        },
                        '636x476': {
                          type: 'string'
                        },
                        '864x648': {
                          type: 'string'
                        },
                      },
                    }
                  },
                  iva: {
                    type: 'object',
                    required: [
                      'DateInfoStep'
                    ],
                    properties: {
                      DateInfoStep: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: [
                            'payload'
                          ],
                          properties: {
                            payload: {
                              type: 'object',
                              properties: {
                                absolute: {
                                  type: 'string',
                                  nullable: true
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
