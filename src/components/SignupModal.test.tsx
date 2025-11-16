import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { SignupModal } from './SignupModal'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SignupModal', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <BrowserRouter>
        <SignupModal isOpen={false} onClose={vi.fn()} feature="add-characters" />
      </BrowserRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when isOpen is true', () => {
    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="add-characters" />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays correct content for add-characters feature', () => {
    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="add-characters" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Add and Save Characters/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign in to add characters/i)).toBeInTheDocument()
    expect(screen.getByText('➕')).toBeInTheDocument()
  })

  it('displays correct content for training feature', () => {
    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="training" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Start Training with Your Child's Characters/i)).toBeInTheDocument()
    expect(screen.getByText('🥋')).toBeInTheDocument()
  })

  it('displays correct content for manage-characters feature', () => {
    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="manage-characters" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Manage Your Child's Characters/i)).toBeInTheDocument()
    expect(screen.getByText('📚')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={onClose} feature="training" />
      </BrowserRouter>
    )

    const closeButton = screen.getByLabelText('Close')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('navigates to /auth when Sign In button clicked', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="training" />
      </BrowserRouter>
    )

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    expect(mockNavigate).toHaveBeenCalledWith('/auth')
  })

  it('displays reassurance text', () => {
    render(
      <BrowserRouter>
        <SignupModal isOpen={true} onClose={vi.fn()} feature="training" />
      </BrowserRouter>
    )

    expect(screen.getByText(/Free to use/i)).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
  })
})
