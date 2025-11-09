// Component smoke tests for Offline components
// Covers: ConnectionStatusBadge rendering, OfflineAwareButton behavior

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConnectionStatusBadge, OfflineAwareButton } from './OfflineBlocker'

// Mock the useConnectionStatus hook
vi.mock('../lib/offlineDetection', () => ({
  useConnectionStatus: vi.fn(() => ({
    status: 'online',
    isOnline: true,
    lastChecked: new Date(),
    error: null,
  })),
  useConnectionRecheck: vi.fn(() => ({
    connectionState: { status: 'online', isOnline: true, lastChecked: new Date(), error: null },
    recheck: vi.fn(),
    isRechecking: false,
  })),
}))

describe('ConnectionStatusBadge', () => {
  it('should render online status', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'online',
      isOnline: true,
      lastChecked: new Date(),
      error: null,
    })

    render(<ConnectionStatusBadge />)
    const badge = screen.getByText(/online/i)
    expect(badge).toBeInTheDocument()
  })

  it('should render offline status', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'offline',
      isOnline: false,
      lastChecked: new Date(),
      error: new Error('Offline'),
    })

    render(<ConnectionStatusBadge />)
    const badge = screen.getByText(/offline/i)
    expect(badge).toBeInTheDocument()
  })

  it('should render checking status', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'checking',
      isOnline: false,
      lastChecked: null,
      error: null,
    })

    render(<ConnectionStatusBadge />)
    const badge = screen.getByText(/checking/i)
    expect(badge).toBeInTheDocument()
  })
})

describe('OfflineAwareButton', () => {
  it('should render button with children', () => {
    render(
      <OfflineAwareButton>
        Click Me
      </OfflineAwareButton>
    )

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('should not be disabled when online', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'online',
      isOnline: true,
      lastChecked: new Date(),
      error: null,
    })

    render(
      <OfflineAwareButton>
        Click Me
      </OfflineAwareButton>
    )

    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should be disabled when offline', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'offline',
      isOnline: false,
      lastChecked: new Date(),
      error: new Error('Offline'),
    })

    render(
      <OfflineAwareButton>
        Click Me
      </OfflineAwareButton>
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should show offline message when offline and showOfflineMessage is true', () => {
    const { useConnectionStatus } = require('../lib/offlineDetection')
    useConnectionStatus.mockReturnValue({
      status: 'offline',
      isOnline: false,
      lastChecked: new Date(),
      error: new Error('Offline'),
    })

    render(
      <OfflineAwareButton showOfflineMessage={true}>
        Click Me
      </OfflineAwareButton>
    )

    const message = screen.getByText(/this action requires an internet connection/i)
    expect(message).toBeInTheDocument()
  })
})
