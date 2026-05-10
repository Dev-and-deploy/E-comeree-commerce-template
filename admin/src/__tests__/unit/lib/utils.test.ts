/**
 * WHAT  : Unit tests for the cn() (class-name merger) utility.
 * WHY   : cn() is used on nearly every component to conditionally apply
 *         Tailwind classes. A broken merge would cause invisible styling bugs
 *         that are very hard to track down.
 * HOW   : Calls cn() with various inputs and checks the output string.
 */
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() — Tailwind class merger', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('merges multiple classes into one string', () => {
    expect(cn('px-4', 'py-2', 'rounded')).toBe('px-4 py-2 rounded')
  })

  it('ignores falsy values (undefined, false, null)', () => {
    expect(cn('base', undefined, false, null, 'extra')).toBe('base extra')
  })

  it('deduplicates conflicting Tailwind utilities (last wins)', () => {
    // twMerge resolves p-2 vs p-4 — the later one wins
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles conditional class objects', () => {
    const isActive = true
    const result = cn('base', { 'text-blue-500': isActive, 'text-gray-500': !isActive })
    expect(result).toContain('text-blue-500')
    expect(result).not.toContain('text-gray-500')
  })
})
