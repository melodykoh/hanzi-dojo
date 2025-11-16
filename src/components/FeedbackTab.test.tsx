import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackTab } from './FeedbackTab';

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

  it('renders embedded Tally iframe with form URL', async () => {
    render(<FeedbackTab />);
    await waitFor(() => {
      const iframe = screen.getByTitle('Feedback Form');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src');
      const src = iframe.getAttribute('src');
      expect(src).toContain('https://tally.so/embed/VLL59J');
      expect(src).toContain('user_type=demo');
    });
  });

  it('displays privacy notice', () => {
    render(<FeedbackTab />);
    expect(screen.getByText(/Privacy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your feedback is confidential/i)).toBeInTheDocument();
  });
});
