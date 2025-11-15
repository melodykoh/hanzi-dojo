import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { DemoDashboard } from './DemoDashboard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('DemoDashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders demo mode banner', () => {
    render(
      <BrowserRouter>
        <DemoDashboard />
      </BrowserRouter>
    )

    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/sample data/i)).toBeInTheDocument()
  })

  it('renders all demo metrics correctly', () => {
    render(
      <BrowserRouter>
        <DemoDashboard />
      </BrowserRouter>
    )

    // Verify metrics display
    expect(screen.getByText('47')).toBeInTheDocument() // totalCharacters
    expect(screen.getByText('18')).toBeInTheDocument() // knownCountDrillA
    expect(screen.getByText('12')).toBeInTheDocument() // knownCountDrillB
    expect(screen.getByText('82%')).toBeInTheDocument() // accuracyDrillA
  })

  it('navigates to /auth when Sign In button clicked', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <DemoDashboard />
      </BrowserRouter>
    )

    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    await user.click(signInButtons[0]) // Click first Sign In button

    expect(mockNavigate).toHaveBeenCalledWith('/auth')
  })

  it('displays all metric categories', () => {
    render(
      <BrowserRouter>
        <DemoDashboard />
      </BrowserRouter>
    )

    expect(screen.getByText(/Total Characters/i)).toBeInTheDocument()
    expect(screen.getByText(/Known \(Drill A\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Known \(Drill B\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Weekly Familiarity/i)).toBeInTheDocument()
    expect(screen.getByText(/Current Belt/i)).toBeInTheDocument()
    expect(screen.getByText(/Practice Streak/i)).toBeInTheDocument()
  })
})
