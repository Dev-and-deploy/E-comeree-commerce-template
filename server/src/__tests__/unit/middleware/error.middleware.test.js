/**
 * WHAT  : Tests for the global Express error handler.
 * WHY   : All unhandled errors flow through here. Wrong handling means leaking
 *         stack traces in production or returning incorrect HTTP status codes.
 * HOW   : Calls errorHandler() directly with crafted error objects and asserts
 *         the JSON response shape and status code.
 */
import { describe, it, expect, vi } from 'vitest'
import { errorHandler, notFoundHandler } from '../../../shared/middleware/error.middleware.js'
import { ApiError } from '../../../shared/errors/ApiError.js'

const mockRes = () => {
  const res = { status: vi.fn(), json: vi.fn() }
  res.status.mockReturnValue(res)
  return res
}

describe('errorHandler middleware', () => {
  it('handles ApiError with the correct status code and message', () => {
    const res = mockRes()
    const err = ApiError.notFound('Category not found')
    errorHandler(err, {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Category not found' })
    )
  })

  it('handles Prisma P2002 (unique constraint) as 409', () => {
    const res = mockRes()
    const err = { name: 'PrismaClientKnownRequestError', code: 'P2002' }
    errorHandler(err, {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Record already exists' })
    )
  })

  it('handles Prisma P2025 (record not found) as 404', () => {
    const res = mockRes()
    const err = { name: 'PrismaClientKnownRequestError', code: 'P2025' }
    errorHandler(err, {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 500 for unknown errors', () => {
    const res = mockRes()
    errorHandler(new Error('Unexpected'), {}, res, vi.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    )
  })

  it('includes validation errors array from ApiError', () => {
    const res = mockRes()
    const errors = [{ field: 'email', message: 'Invalid email' }]
    const err = ApiError.badRequest('Validation failed', errors)
    errorHandler(err, {}, res, vi.fn())
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors })
    )
  })
})

describe('notFoundHandler middleware', () => {
  it('calls next() with a 404 ApiError for unknown routes', () => {
    const next = vi.fn()
    notFoundHandler({}, {}, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }))
  })
})
