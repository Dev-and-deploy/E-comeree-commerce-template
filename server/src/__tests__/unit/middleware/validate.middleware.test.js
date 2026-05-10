/**
 * WHAT  : Tests for the Zod validation middleware.
 * WHY   : This is the first line of defense against bad input. If it fails to
 *         reject invalid payloads, malformed data reaches the database.
 * HOW   : Passes valid/invalid request shapes through validate() and asserts
 *         whether next() is called cleanly or with a 400 ApiError.
 */
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { validate } from '../../../shared/middleware/validate.middleware.js'

const schema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
})

describe('validate middleware', () => {
  it('calls next() with no error when body is valid', () => {
    const req = { body: { name: 'Women', slug: 'women' }, query: {}, params: {} }
    const next = vi.fn()
    validate(schema)(req, {}, next)
    expect(next).toHaveBeenCalledWith() // no error argument
    expect(req.validated).toBeDefined()
  })

  it('calls next() with a 400 ApiError when body is invalid', () => {
    const req = { body: { name: '' }, query: {}, params: {} }
    const next = vi.fn()
    validate(schema)(req, {}, next)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'Validation failed' })
    )
  })

  it('includes field-level error details in the ApiError', () => {
    const req = { body: {}, query: {}, params: {} }
    const next = vi.fn()
    validate(schema)(req, {}, next)
    const err = next.mock.calls[0][0]
    expect(err.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: expect.any(String) })])
    )
  })
})
