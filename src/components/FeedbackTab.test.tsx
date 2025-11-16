import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackTab } from './FeedbackTab';

// Mock react-tally
vi.mock('react-tally', () => ({
  useTallyPopup: () => ({
    open: vi.fn(),
    close: vi.fn()
  })
}));

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    }
  }
}));

describe('FeedbackTab', () => {
  it('renders feedback tab with title', () => {
    render(<FeedbackTab />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders intro text', () => {
    render(<FeedbackTab />);
    expect(screen.getByText(/We'd love to hear from you/i)).toBeInTheDocument();
  });

  it('renders three action cards', () => {
    render(<FeedbackTab />);
    expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    expect(screen.getByText('Request a Feature')).toBeInTheDocument();
    expect(screen.getByText('General Feedback')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<FeedbackTab />);
    expect(screen.getByRole('button', { name: /Report Bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Share Idea/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Feedback/i })).toBeInTheDocument();
  });

  it('displays privacy notice', () => {
    render(<FeedbackTab />);
    expect(screen.getByText(/Privacy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your feedback is confidential/i)).toBeInTheDocument();
  });

  it('displays emoji icons for each card', () => {
    render(<FeedbackTab />);
    const cards = screen.getAllByText(/🐛|✨|💬/);
    expect(cards).toHaveLength(3);
  });
});
