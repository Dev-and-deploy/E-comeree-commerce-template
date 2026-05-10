/**
 * WHAT  : Unit tests for the Redux authSlice.
 * WHY   : Auth state drives every protected route and permission check in the
 *         admin. A broken reducer (e.g. logout not clearing the user) would let
 *         a logged-out session still appear authenticated.
 * HOW   : Creates a Redux store with just the auth reducer and dispatches
 *         actions directly, then asserts the resulting state shape.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  setCredentials,
  setAuthInitialized,
  setUser,
  logout,
  type User,
} from '@/store/slices/authSlice'

const makeStore = () =>
  configureStore({ reducer: { auth: authReducer } })

const adminUser: User = {
  id: 'u1',
  name: 'Super Admin',
  email: 'admin@store.com',
  role: 'SUPER_ADMIN',
}

describe('authSlice', () => {
  let store: ReturnType<typeof makeStore>

  beforeEach(() => {
    sessionStorage.clear()
    store = makeStore()
  })

  describe('setCredentials()', () => {
    it('sets user, marks authenticated, and marks auth as initialized', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      const { auth } = store.getState()

      expect(auth.user).toEqual(adminUser)
      expect(auth.isAuthenticated).toBe(true)
      expect(auth.authInitialized).toBe(true)
    })

    it('persists user to sessionStorage', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      const stored = JSON.parse(sessionStorage.getItem('admin_user')!)
      expect(stored.email).toBe('admin@store.com')
    })
  })

  describe('logout()', () => {
    it('clears user and marks as unauthenticated', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      store.dispatch(logout())
      const { auth } = store.getState()

      expect(auth.user).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
    })

    it('removes user from sessionStorage', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      store.dispatch(logout())
      expect(sessionStorage.getItem('admin_user')).toBeNull()
    })
  })

  describe('setAuthInitialized()', () => {
    it('sets user and authenticated when a valid user is provided', () => {
      store.dispatch(setAuthInitialized({ user: adminUser }))
      const { auth } = store.getState()

      expect(auth.authInitialized).toBe(true)
      expect(auth.isAuthenticated).toBe(true)
      expect(auth.user).toEqual(adminUser)
    })

    it('clears user when called with no user (session expired)', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      store.dispatch(setAuthInitialized({ user: null }))
      const { auth } = store.getState()

      expect(auth.user).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(auth.authInitialized).toBe(true)
    })
  })

  describe('setUser()', () => {
    it('updates the user profile without changing auth status', () => {
      store.dispatch(setCredentials({ user: adminUser }))
      const updated: User = { ...adminUser, name: 'Updated Name' }
      store.dispatch(setUser(updated))

      expect(store.getState().auth.user!.name).toBe('Updated Name')
      expect(store.getState().auth.isAuthenticated).toBe(true)
    })
  })
})
