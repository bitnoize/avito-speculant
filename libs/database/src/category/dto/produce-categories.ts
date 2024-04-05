import { Category } from '../category.js'
import { DatabaseMethod } from '../../database.js'

export type ProduceCategoriesRequest = {
  limit: number
}

export type ProduceCategoriesResponse = {
  categories: Category[]
}

export type ProduceCategories = DatabaseMethod<ProduceCategoriesRequest, ProduceCategoriesResponse>

