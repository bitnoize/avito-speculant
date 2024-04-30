import { Category } from '../category.js'
import { DatabaseMethod } from '../../database.js'

export type ListCategoriesRequest = {
  userId: number
}

export type ListCategoriesResponse = {
  categories: Category[]
}

export type ListCategories = DatabaseMethod<ListCategoriesRequest, ListCategoriesResponse>
