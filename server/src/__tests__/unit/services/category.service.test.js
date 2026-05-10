/**
 * WHAT  : Unit tests for CategoryService — the business logic layer.
 * WHY   : Services contain the rules: duplicate slug detection, cache
 *         invalidation on mutation, not-found guards. Testing them in isolation
 *         (without a real DB) keeps tests fast and deterministic.
 * HOW   : The CategoryRepository is replaced with a vi.fn() mock. We assert
 *         that the service calls the right repo methods and throws the right
 *         ApiErrors under failure conditions.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../modules/category/category.repository.js', () => ({
  // Must use `function` keyword — arrow functions cannot be `new`-ed as constructors
  CategoryRepository: vi.fn(function () {
    this.findActive = vi.fn()
    this.findAll = vi.fn()
    this.findBySlug = vi.fn()
    this.findById = vi.fn()
    this.create = vi.fn()
    this.update = vi.fn()
    this.softDelete = vi.fn()
  }),
}))

vi.mock('../../../core/cache/redis.js', () => ({
  cacheDelPattern: vi.fn().mockResolvedValue(undefined),
}))

import { CategoryService } from '../../../modules/category/category.service.js'
import { CategoryRepository } from '../../../modules/category/category.repository.js'
import { cacheDelPattern } from '../../../core/cache/redis.js'

let service
let repo

beforeEach(() => {
  vi.clearAllMocks()
  service = new CategoryService()
  repo = CategoryRepository.mock.instances[0]
})

describe('CategoryService.getCategories()', () => {
  it('returns all active categories from the repository', async () => {
    const data = [{ id: '1', name: 'Women', slug: 'women' }]
    repo.findActive.mockResolvedValue(data)

    const result = await service.getCategories()

    expect(repo.findActive).toHaveBeenCalledOnce()
    expect(result).toEqual(data)
  })
})

describe('CategoryService.createCategory()', () => {
  it('creates a category when the slug is unique', async () => {
    repo.findBySlug.mockResolvedValue(null)
    const created = { id: '1', name: 'Women', slug: 'women' }
    repo.create.mockResolvedValue(created)

    const result = await service.createCategory({ name: 'Women', slug: 'women' })

    expect(repo.findBySlug).toHaveBeenCalledWith('women')
    expect(repo.create).toHaveBeenCalledWith({ name: 'Women', slug: 'women' })
    expect(result).toEqual(created)
  })

  it('throws 409 when the slug already exists', async () => {
    repo.findBySlug.mockResolvedValue({ id: '99', slug: 'women' })

    await expect(service.createCategory({ name: 'Women', slug: 'women' }))
      .rejects.toMatchObject({ statusCode: 409, message: 'Category slug already exists' })

    expect(repo.create).not.toHaveBeenCalled()
  })
})

describe('CategoryService.updateCategory()', () => {
  it('updates the category and invalidates the product cache', async () => {
    const existing = { id: '1', name: 'Women', slug: 'women' }
    repo.findById.mockResolvedValue(existing)
    repo.update.mockResolvedValue({ ...existing, name: 'Updated' })

    await service.updateCategory('1', { name: 'Updated' })

    expect(repo.update).toHaveBeenCalledWith('1', { name: 'Updated' })
    expect(cacheDelPattern).toHaveBeenCalledWith('product:*')
    expect(cacheDelPattern).toHaveBeenCalledWith('products:*')
  })

  it('throws 404 when the category does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(service.updateCategory('999', {}))
      .rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('CategoryService.deleteCategory()', () => {
  it('soft-deletes the category and invalidates the product cache', async () => {
    repo.findById.mockResolvedValue({ id: '1' })
    repo.softDelete.mockResolvedValue({ id: '1', isActive: false })

    await service.deleteCategory('1')

    expect(repo.softDelete).toHaveBeenCalledWith('1')
    expect(cacheDelPattern).toHaveBeenCalledWith('product:*')
  })

  it('throws 404 when the category does not exist', async () => {
    repo.findById.mockResolvedValue(null)

    await expect(service.deleteCategory('999'))
      .rejects.toMatchObject({ statusCode: 404 })
  })
})
