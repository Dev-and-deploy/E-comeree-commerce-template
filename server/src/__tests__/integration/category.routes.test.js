/**
 * WHAT  : Integration tests for /api/categories routes using supertest.
 * WHY   : Unit tests verify logic in isolation; integration tests verify that
 *         the Express router, middleware chain (auth, validation, error handler),
 *         and service all wire together correctly end-to-end.
 * HOW   : The real Express app is loaded. Prisma, Redis, and BullMQ are mocked
 *         at the module level so no real connections are made. A JWT is signed
 *         with the config fallback secret so authenticate() passes normally.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

// ── Mock all modules that open connections at import time ─────────────────────

// Redis client (default export) + cache helpers
vi.mock('../../core/cache/redis.js', () => {
  const client = { on: vi.fn(), get: vi.fn(), set: vi.fn(), del: vi.fn(), keys: vi.fn() }
  return {
    default: client,
    cacheGet: vi.fn().mockResolvedValue(null),
    cacheSet: vi.fn().mockResolvedValue(undefined),
    cacheDel: vi.fn().mockResolvedValue(undefined),
    cacheDelPattern: vi.fn().mockResolvedValue(undefined),
  }
})

// BullMQ queues (imports the redis default above)
vi.mock('../../core/queue/index.js', () => ({
  addEmailJob: vi.fn().mockResolvedValue(undefined),
  addOrderJob: vi.fn().mockResolvedValue(undefined),
  addNotificationJob: vi.fn().mockResolvedValue(undefined),
  emailQueue: { add: vi.fn() },
  orderQueue: { add: vi.fn() },
  notificationQueue: { add: vi.fn() },
}))

// Prisma client ($connect() runs at import time)
vi.mock('../../core/database/prisma.js', () => ({
  default: {
    category: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

vi.mock('../../shared/middleware/rateLimiter.middleware.js', () => ({
  apiLimiter: (_req, _res, next) => next(),
  authLimiter: (_req, _res, next) => next(),
}))

// Override config so we control the JWT secret in tests
vi.mock('../../core/config/index.js', () => ({
  default: {
    env: 'test',
    port: 4000,
    clientUrl: 'http://localhost:3000',
    adminUrl: 'http://localhost:8080',
    db: { url: 'postgresql://test:test@localhost:5432/test' },
    redis: { url: 'redis://localhost:6379' },
    jwt: {
      secret: 'integration-test-jwt-secret-long-enough',
      expiresIn: '15m',
      refreshSecret: 'integration-test-refresh-secret-long',
      refreshExpiresIn: '7d',
    },
    cloudinary: {},
    stripe: {},
    resend: { from: 'test@test.com' },
    store: { name: 'TestStore' },
  },
}))

// ── Now safe to import app ────────────────────────────────────────────────────
import app from '../../app.js'
import prisma from '../../core/database/prisma.js'

const JWT_SECRET = 'integration-test-jwt-secret-long-enough'

const adminUser = {
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'SUPER_ADMIN',
  isActive: true,
}

const adminToken = () =>
  jwt.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role }, JWT_SECRET, {
    expiresIn: '15m',
  })

beforeEach(() => {
  vi.clearAllMocks()
  prisma.user.findUnique.mockResolvedValue(adminUser)
})

// ── GET /api/health ───────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 with status ok (no auth required)', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

// ── GET /api/categories ───────────────────────────────────────────────────────

describe('GET /api/categories', () => {
  it('returns active categories as a public endpoint', async () => {
    prisma.category.findMany.mockResolvedValue([
      { id: '1', name: 'Women', slug: 'women', isActive: true },
    ])

    const res = await request(app).get('/api/categories')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })
})

// ── POST /api/categories ──────────────────────────────────────────────────────

describe('POST /api/categories', () => {
  it('creates a category when authenticated as admin', async () => {
    prisma.category.findUnique.mockResolvedValue(null) // slug available
    prisma.category.create.mockResolvedValue({ id: '2', name: 'Men', slug: 'men', isActive: true })

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Men', slug: 'men' })

    expect(res.status).toBe(201)
    expect(res.body.data.slug).toBe('men')
  })

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Men', slug: 'men' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: '' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

// ── DELETE /api/categories/:id ────────────────────────────────────────────────

describe('DELETE /api/categories/:id', () => {
  it('soft-deletes a category when authenticated as admin', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: '1', name: 'Women', isActive: true })
    prisma.category.update.mockResolvedValue({ id: '1', isActive: false })

    const res = await request(app)
      .delete('/api/categories/1')
      .set('Authorization', `Bearer ${adminToken()}`)

    expect(res.status).toBe(204)
  })
})
