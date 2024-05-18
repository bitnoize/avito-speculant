import { JSONSchemaType } from 'ajv'
import { configLogLevelSchema } from '@avito-speculant/logger'
import {
  configRedisHostSchema,
  configRedisPortSchema,
  configRedisDatabaseSchema,
  configRedisUsernameSchema,
  configRedisPasswordSchema
} from '@avito-speculant/redis'
import {
  configQueueRedisHostSchema,
  configQueueRedisPortSchema,
  configQueueRedisDatabaseSchema,
  configQueueRedisUsernameSchema,
  configQueueRedisPasswordSchema,
  configScrapingConcurrencySchema,
  configScrapingLimiterMaxSchema,
  configScrapingLimiterDurationSchema
} from '@avito-speculant/queue'
import {
  Config,
  AvitoDesktopDataCatalogItemCategory,
  AvitoDesktopDataCatalogItemPriceDetailed,
  AvitoDesktopDataCatalogItemImage,
  AvitoDesktopDataCatalogItemIva,
  AvitoDesktopDataCatalogItem,
  AvitoDesktop
} from './worker-scraping.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'REDIS_USERNAME',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'QUEUE_REDIS_USERNAME',
    'SCRAPING_CONCURRENCY',
    'SCRAPING_LIMITER_MAX',
    'SCRAPING_LIMITER_DURATION'
  ],
  properties: {
    LOG_LEVEL: configLogLevelSchema,
    REDIS_HOST: configRedisHostSchema,
    REDIS_PORT: configRedisPortSchema,
    REDIS_DATABASE: configRedisDatabaseSchema,
    REDIS_USERNAME: configRedisUsernameSchema,
    REDIS_PASSWORD: {
      ...configRedisPasswordSchema,
      nullable: true
    },
    QUEUE_REDIS_HOST: configQueueRedisHostSchema,
    QUEUE_REDIS_PORT: configQueueRedisPortSchema,
    QUEUE_REDIS_DATABASE: configQueueRedisDatabaseSchema,
    QUEUE_REDIS_USERNAME: configQueueRedisUsernameSchema,
    QUEUE_REDIS_PASSWORD: {
      ...configQueueRedisPasswordSchema,
      nullable: true
    },
    SCRAPING_CONCURRENCY: configScrapingConcurrencySchema,
    SCRAPING_LIMITER_MAX: configScrapingLimiterMaxSchema,
    SCRAPING_LIMITER_DURATION: configScrapingLimiterDurationSchema
  }
}

//
// AvitoDesktop
//

export const avitoDesktopDataCatalogItemCategorySchema: JSONSchemaType<AvitoDesktopDataCatalogItemCategory> =
  {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        nullable: true
      },
      name: {
        type: 'string',
        nullable: true
      }
    }
  }

export const avitoDesktopDataCatalogItemPriceDetailedSchema: JSONSchemaType<AvitoDesktopDataCatalogItemPriceDetailed> =
  {
    type: 'object',
    properties: {
      value: {
        type: 'integer',
        nullable: true
      }
    }
  }

export const avitoDesktopDataCatalogItemImagesSchema: JSONSchemaType<
  AvitoDesktopDataCatalogItemImage[]
> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      '208x156': {
        type: 'string',
        nullable: true
      },
      '236x177': {
        type: 'string',
        nullable: true
      },
      '318x238': {
        type: 'string',
        nullable: true
      },
      '416x312': {
        type: 'string',
        nullable: true
      },
      '432x324': {
        type: 'string',
        nullable: true
      },
      '472x354': {
        type: 'string',
        nullable: true
      },
      '636x476': {
        type: 'string',
        nullable: true
      },
      '864x648': {
        type: 'string',
        nullable: true
      }
    }
  }
}

export const avitoDesktopDataCatalogItemIvaSchema: JSONSchemaType<AvitoDesktopDataCatalogItemIva> =
  {
    type: 'object',
    properties: {
      DateInfoStep: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              properties: {
                absolute: {
                  type: 'string',
                  nullable: true
                }
              },
              nullable: true
            }
          }
        },
        nullable: true
      }
    }
  }

export const avitoDesktopDataCatalogItemsSchema: JSONSchemaType<AvitoDesktopDataCatalogItem[]> = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        nullable: true
      },
      title: {
        type: 'string',
        nullable: true
      },
      description: {
        type: 'string',
        nullable: true
      },
      sortTimeStamp: {
        type: 'integer',
        nullable: true
      },
      urlPath: {
        type: 'string',
        nullable: true
      },
      category: {
        ...avitoDesktopDataCatalogItemCategorySchema,
        nullable: true
      },
      priceDetailed: {
        ...avitoDesktopDataCatalogItemPriceDetailedSchema,
        nullable: true
      },
      images: {
        ...avitoDesktopDataCatalogItemImagesSchema,
        nullable: true
      },
      iva: {
        ...avitoDesktopDataCatalogItemIvaSchema,
        nullable: true
      }
    }
  }
}

export const avitoDesktopSchema: JSONSchemaType<AvitoDesktop> = {
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
            items: avitoDesktopDataCatalogItemsSchema
          }
        }
      }
    }
  }
}
