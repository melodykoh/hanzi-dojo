import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackTab } from './FeedbackTab';

// Mock react-tally
vi.mock('react-tally', () => ({
  TallyForm: ({ formId }: { formId: string }) => (
    <div data-testid="tally-form">Tally Form: {formId}</div>
  )
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

  it('renders embedded Tally form', () => {
    render(<FeedbackTab />);
    const tallyForm = screen.getByTestId('tally-form');
    expect(tallyForm).toBeInTheDocument();
    expect(tallyForm).toHaveTextContent('Tally Form: VLL59J');
  });

  it('displays privacy notice', () => {
    render(<FeedbackTab />);
    expect(screen.getByText(/Privacy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your feedback is confidential/i)).toBeInTheDocument();
  });
});
