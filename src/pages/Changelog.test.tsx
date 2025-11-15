import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Changelog } from './Changelog'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Changelog', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // Never resolves

    render(
      <BrowserRouter>
        <Changelog />
      </BrowserRouter>
    )

    expect(screen.getByText(/Loading changelog/i)).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  it('fetches and displays markdown content', async () => {
    const mockMarkdown = '# Changelog\n\n## November 2025\n\nTest content'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockMarkdown),
    })

    render(
      <BrowserRouter>
        <Changelog />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Changelog')).toBeInTheDocument()
      expect(screen.getByText('November 2025')).toBeInTheDocument()
    })
  })

  it('displays error message on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(
      <BrowserRouter>
        <Changelog />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Unable to load changelog/i)).toBeInTheDocument()
      expect(screen.getByText('⚠️')).toBeInTheDocument()
    })
  })

  it('navigates back to dashboard when Back button clicked', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Test'),
    })

    render(
      <BrowserRouter>
        <Changelog />
      </BrowserRouter>
    )

    await waitFor(() => screen.getByText(/Back to Dashboard/i))

    const backButton = screen.getByText(/Back to Dashboard/i)
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles 404 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve(''),
    })

    render(
      <BrowserRouter>
        <Changelog />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Unable to load changelog/i)).toBeInTheDocument()
    })
  })
})
