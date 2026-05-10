/**
 * WHAT  : Tests for the JWT authentication middleware.
 * WHY   : Every protected route depends on this. A bug here lets unauthenticated
 *         users access admin endpoints or blocks valid users.
 * HOW   : Mocks jwt.verify and Prisma's user lookup. Calls authenticate() with
 *         crafted request headers/cookies and asserts req.user or the error passed
 *         to next().
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma before importing the middleware
vi.mock('../../../core/database/prisma.js', () => ({
  default: { user: { findUnique: vi.fn() } },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
    // The middleware uses `instanceof` on these — they must be real classes
    JsonWebTokenError: class JsonWebTokenError extends Error {},
    TokenExpiredError: class TokenExpiredError extends Error {},
  },
}))

vi.mock('../../../core/config/index.js', () => ({
  default: { jwt: { secret: 'test-secret' } },
}))

import { authenticate } from '../../../shared/middleware/auth.middleware.js'
import prisma from '../../../core/database/prisma.js'
import jwt from 'jsonwebtoken'

const activeUser = { id: 'user-1', email: 'admin@test.com', name: 'Admin', role: 'SUPER_ADMIN', isActive: true }

const makeReq = (token, via = 'header') => {
  if (via === 'cookie') return { headers: { cookie: `accessToken=${token}` } }
  return { headers: { authorization: `Bearer ${token}` } }
}

describe('authenticate middleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('attaches user to req and calls next() for a valid token', async () => {
    jwt.verify.mockReturnValue({ sub: 'user-1' })
    prisma.user.findUnique.mockResolvedValue(activeUser)
    const req = makeReq('valid-token')
    const next = vi.fn()

    await authenticate(req, {}, next)

    expect(req.user).toEqual(activeUser)
    expect(next).toHaveBeenCalledWith() // no error
  })

  it('reads the token from the cookie when present', async () => {
    jwt.verify.mockReturnValue({ sub: 'user-1' })
    prisma.user.findUnique.mockResolvedValue(activeUser)
    const req = makeReq('cookie-token', 'cookie')
    const next = vi.fn()

    await authenticate(req, {}, next)

    expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'test-secret')
  })

  it('passes 401 to next() when no token is provided', async () => {
    const req = { headers: {} }
    const next = vi.fn()

    await authenticate(req, {}, next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('passes 401 to next() when the user does not exist in the DB', async () => {
    jwt.verify.mockReturnValue({ sub: 'ghost-id' })
    prisma.user.findUnique.mockResolvedValue(null)
    const next = vi.fn()

    await authenticate(makeReq('some-token'), {}, next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })

  it('passes 401 to next() when the account is deactivated', async () => {
    jwt.verify.mockReturnValue({ sub: 'user-1' })
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false })
    const next = vi.fn()

    await authenticate(makeReq('some-token'), {}, next)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }))
  })
})
