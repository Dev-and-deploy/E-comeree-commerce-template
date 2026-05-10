/**
 * WHAT  : Tests for the HTTP response helper functions.
 * WHY   : Every API endpoint uses these helpers to send responses. A bug here
 *         would break the entire API contract (wrong status codes, wrong shape).
 * HOW   : Creates a mock Express `res` object and asserts the correct status
 *         code and JSON body are set.
 */
import { describe, it, expect, vi } from 'vitest'
import { success, created, paginated, noContent } from '../../../shared/helpers/response.js'

const mockRes = () => {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() }
  res.status.mockReturnValue(res) // enable chaining: res.status(200).json(...)
  return res
}

describe('Response helpers', () => {
  describe('success()', () => {
    it('sends 200 with success=true and data', () => {
      const res = mockRes()
      success(res, { id: 1 })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Success', data: { id: 1 } })
    })

    it('accepts a custom message', () => {
      const res = mockRes()
      success(res, null, 'Done')
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Done' }))
    })
  })

  describe('created()', () => {
    it('sends 201 with the created resource', () => {
      const res = mockRes()
      created(res, { id: 2 }, 'Category created')
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Category created', data: { id: 2 } })
      )
    })
  })

  describe('paginated()', () => {
    it('sends 200 with data and pagination metadata', () => {
      const res = mockRes()
      const pagination = { total: 50, page: 1, limit: 10, totalPages: 5 }
      paginated(res, [{ id: 1 }], pagination)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: [{ id: 1 }], pagination })
      )
    })
  })

  describe('noContent()', () => {
    it('sends 204 with no body', () => {
      const res = mockRes()
      noContent(res)
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })
  })
})
