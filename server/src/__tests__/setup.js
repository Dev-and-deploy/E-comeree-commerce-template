import { vi, afterEach } from 'vitest'

// Suppress winston logs during tests
vi.mock('../core/utils/logger.js', () => ({
  default: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

// Prevent real queue connections (BullMQ → Redis)
vi.mock('../core/queue/index.js', () => ({
  addEmailJob: vi.fn().mockResolvedValue(undefined),
  addOrderJob: vi.fn().mockResolvedValue(undefined),
}))

afterEach(() => vi.clearAllMocks())
