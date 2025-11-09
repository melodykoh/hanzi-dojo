// Component smoke tests for FeedbackToast
// Covers: Rendering, props handling, visibility logic

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackToast } from './FeedbackToast'

describe('FeedbackToast', () => {
  it('should render when show is true', () => {
    render(
      <FeedbackToast
        show={true}
        points={1.0}
        message="Great job!"
        onHide={() => {}}
      />
    )

    const toast = screen.getByText(/Great job!/i)
    expect(toast).toBeInTheDocument()
  })

  it('should not render when show is false', () => {
    render(
      <FeedbackToast
        show={false}
        points={1.0}
        message="Hidden message"
        onHide={() => {}}
      />
    )

    const toast = screen.queryByText(/Hidden message/i)
    expect(toast).not.toBeInTheDocument()
  })

  it('should display +1.0 points correctly', () => {
    render(
      <FeedbackToast
        show={true}
        points={1.0}
        message=""
        onHide={() => {}}
      />
    )

    const points = screen.getByText(/\+1\.0/i)
    expect(points).toBeInTheDocument()
  })

  it('should display +0.5 points correctly', () => {
    render(
      <FeedbackToast
        show={true}
        points={0.5}
        message=""
        onHide={() => {}}
      />
    )

    const points = screen.getByText(/\+0\.5/i)
    expect(points).toBeInTheDocument()
  })

  it('should display 0 points correctly', () => {
    render(
      <FeedbackToast
        show={true}
        points={0}
        message=""
        onHide={() => {}}
      />
    )

    const points = screen.getByText(/0 points/i)
    expect(points).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    const customMessage = "Excellent work, young warrior!"
    render(
      <FeedbackToast
        show={true}
        points={1.0}
        message={customMessage}
        onHide={() => {}}
      />
    )

    const message = screen.getByText(customMessage)
    expect(message).toBeInTheDocument()
  })

  it('should use default Sensei message when message prop is empty', () => {
    render(
      <FeedbackToast
        show={true}
        points={1.0}
        message=""
        onHide={() => {}}
      />
    )

    // Should show some Sensei message (checking for common words)
    const toast = screen.getByRole('alert')
    expect(toast.textContent).toBeTruthy()
    expect(toast.textContent?.length).toBeGreaterThan(10)
  })
})
