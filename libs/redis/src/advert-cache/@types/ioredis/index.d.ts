import { Result, Callback } from 'ioredis'

declare module 'ioredis' {
  interface RedisCommander<Context> {
    fetchAdvertCache(
      advertCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    fetchAdvertsIndex(
      advertsIndexKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    saveAdvertCache(
      advertCacheKey: string, // KEYS[1]
      scraperId: string, // ARGV[1]
      advertId: number, // ARGV[2]
      title: string, // ARGV[3]
      description: string, // ARGV[4]
      categoryName: string, // ARGV[5]
      priceRub: number, // ARGV[6]
      url: string, // ARGV[7]
      age: string, // ARGV[8]
      imageUrl: string, // ARGV[9]
      postedAt: number, // ARGV[10]
      callback?: Callback<string>
    ): Result<string, Context>

    saveAdvertsIndex(
      advertsIndexKey: string, // KEYS[1]
      advertId: number, // ARGV[1]
      postedAt: number, // ARGV[2]
      callback?: Callback<string>
    ): Result<string, Context>

    dropAdvertCache(
      advertCacheKey: string, // KEYS[1]
      callback?: Callback<string>
    ): Result<string, Context>

    dropAdvertsIndex(
      advertsIndexKey: string, // KEYS[1]
      advertId: number, // ARGV[1]
      callback?: Callback<string>
    ): Result<string, Context>
  }
}
