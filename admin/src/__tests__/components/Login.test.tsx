/**
 * WHAT  : Component tests for the Admin Login page.
 * WHY   : The login form is the entry point to the entire admin. We test that
 *         it renders correctly, calls the login mutation on submit, stores the
 *         user in Redux on success, and displays an error message on failure.
 * HOW   : RTK Query's useLoginMutation is mocked so tests don't hit the
 *         network. The Redux store and React Router are provided via wrappers.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/slices/authSlice'
import Login from '@/pages/admin/Login'

// ── Mock RTK Query hooks ───────────────────────────────────────────────────────

const mockLoginMutation = vi.fn()

vi.mock('@/store/api/authApi', () => ({
  useLoginMutation: () => [mockLoginMutation, { isLoading: false }],
}))

// Mock react-router navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// ── Test helpers ──────────────────────────────────────────────────────────────

const makeStore = () => configureStore({ reducer: { auth: authReducer } })

const renderLogin = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  )

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders the login form with email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('navigates to /admin on successful login with an admin role', async () => {
    // RTK Query returns an object with .unwrap(), not a plain Promise
    mockLoginMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'admin@store.com', name: 'Admin', role: 'SUPER_ADMIN' } } }),
    })

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@store.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Admin@123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'))
  })

  it('shows an error message when login fails', async () => {
    mockLoginMutation.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ data: { message: 'Invalid credentials' } }),
    })

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    )
  })

  it('shows access denied when a non-admin role logs in', async () => {
    mockLoginMutation.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ data: { user: { id: 'u2', email: 'customer@store.com', name: 'Customer', role: 'CUSTOMER' } } }),
    })

    renderLogin()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'customer@store.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
