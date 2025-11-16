import { useState, useEffect } from 'react';
import { TallyForm } from 'react-tally';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function FeedbackTab() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user;
  const formId = 'VLL59J';

  // Build form URL with pre-populated hidden fields
  const buildFormUrl = () => {
    const params = new URLSearchParams({
      email: user?.email || '',
      user_id: user?.id || 'anonymous',
      user_type: user ? 'authenticated' : 'demo',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    });

    return `https://tally.so/r/${formId}?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-heading text-gray-900 mb-3">
          Feedback
        </h2>
        <p className="text-lg text-gray-600">
          We'd love to hear from you! Share bugs, ideas, or questions to help us improve Hanzi Dojo.
        </p>
      </div>

      {/* Embedded Tally Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <TallyForm
          formId={formId}
          onSubmit={(payload) => {
            console.log('Feedback submitted:', payload);
          }}
          style={{
            width: '100%',
            minHeight: '600px',
            border: 'none'
          }}
        />
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          🔒 <strong>Privacy:</strong> Your feedback is confidential and will only be used to improve Hanzi Dojo.
          We'll respond to your email if needed, never for marketing.
          Demo users can submit feedback anonymously.
        </p>
      </div>
    </div>
  );
}
