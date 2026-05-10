/**
 * WHAT  : Unit tests for AuthService — login, register, token refresh, logout.
 * WHY   : Auth is the most security-critical module. Incorrect credential
 *         checks, token generation, or refresh-token rotation can expose the
 *         entire platform.
 * HOW   : AuthRepository is mocked so no real DB or bcrypt hashing occurs for
 *         the repo layer. We use real bcrypt.hash/compare to keep password
 *         logic authentic, and mock JWT with a predictable test secret.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../modules/auth/auth.repository.js', () => ({
  AuthRepository: vi.fn(function () {
    this.findByEmail = vi.fn()
    this.findById = vi.fn()
    this.create = vi.fn()
    this.countAdmins = vi.fn()
    this.updateRefreshToken = vi.fn()
  }),
}))

vi.mock('../../../core/config/index.js', () => ({
  default: {
    jwt: {
      secret: 'test-jwt-secret-that-is-long-enough',
      expiresIn: '15m',
      refreshSecret: 'test-refresh-secret-that-is-long-enough',
      refreshExpiresIn: '7d',
    },
  },
}))

import bcrypt from 'bcryptjs'
import { AuthService } from '../../../modules/auth/auth.service.js'
import { AuthRepository } from '../../../modules/auth/auth.repository.js'

let service
let repo

beforeEach(async () => {
  vi.clearAllMocks()
  service = new AuthService()
  repo = AuthRepository.mock.instances[0]
})

describe('AuthService.login()', () => {
  it('returns user and tokens for valid credentials', async () => {
    const hash = await bcrypt.hash('secret123', 1)
    const user = { id: 'u1', email: 'admin@test.com', password: hash, role: 'SUPER_ADMIN', isActive: true }
    repo.findByEmail.mockResolvedValue(user)
    repo.updateRefreshToken.mockResolvedValue(undefined)

    const result = await service.login({ email: 'admin@test.com', password: 'secret123' })

    expect(result.user.email).toBe('admin@test.com')
    expect(result.user.password).toBeUndefined() // password must be stripped
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('throws 401 when the user does not exist', async () => {
    repo.findByEmail.mockResolvedValue(null)

    await expect(service.login({ email: 'nobody@test.com', password: 'any' }))
      .rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' })
  })

  it('throws 401 when the password is wrong', async () => {
    const hash = await bcrypt.hash('correct-pass', 1)
    repo.findByEmail.mockResolvedValue({ id: 'u1', email: 'x@x.com', password: hash, isActive: true })

    await expect(service.login({ email: 'x@x.com', password: 'wrong-pass' }))
      .rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 401 when the account is deactivated', async () => {
    const hash = await bcrypt.hash('pass', 1)
    repo.findByEmail.mockResolvedValue({ id: 'u1', email: 'x@x.com', password: hash, isActive: false })

    await expect(service.login({ email: 'x@x.com', password: 'pass' }))
      .rejects.toMatchObject({ statusCode: 401, message: 'Account deactivated' })
  })
})

describe('AuthService.refreshToken()', () => {
  it('throws 401 for a revoked refresh token', async () => {
    // User's stored token differs from the presented token
    const hash = await bcrypt.hash('any', 1)
    const user = { id: 'u1', email: 'x@x.com', password: hash, role: 'CUSTOMER', isActive: true, refreshToken: 'stored-token' }

    // Sign a valid refresh token
    const jwt = await import('jsonwebtoken')
    const { default: config } = await import('../../../core/config/index.js')
    const validToken = jwt.default.sign({ sub: 'u1' }, config.jwt.refreshSecret, { expiresIn: '7d' })

    repo.findById.mockResolvedValue({ ...user, refreshToken: 'different-token' })

    await expect(service.refreshToken(validToken))
      .rejects.toMatchObject({ statusCode: 401, message: 'Refresh token revoked' })
  })

  it('throws 401 for a completely invalid refresh token string', async () => {
    await expect(service.refreshToken('not.a.jwt'))
      .rejects.toMatchObject({ statusCode: 401, message: 'Invalid refresh token' })
  })
})

describe('AuthService.logout()', () => {
  it('clears the refresh token from the database', async () => {
    repo.updateRefreshToken.mockResolvedValue(undefined)

    await service.logout('u1')

    expect(repo.updateRefreshToken).toHaveBeenCalledWith('u1', null)
  })
})
