import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function FeedbackTab() {
  const [session, setSession] = useState<Session | null>(null);
  const [formUrl, setFormUrl] = useState<string>('');

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

  // Build form URL with pre-populated hidden fields whenever session changes
  useEffect(() => {
    const user = session?.user;
    const formId = 'VLL59J';

    const params = new URLSearchParams({
      email: user?.email || '',
      user_id: user?.id || 'anonymous',
      user_type: user ? 'authenticated' : 'demo',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    });

    setFormUrl(`https://tally.so/embed/${formId}?${params.toString()}`);
  }, [session]);

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
        {formUrl && (
          <iframe
            src={formUrl}
            width="100%"
            height="700"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Feedback Form"
            style={{
              border: 'none',
              minHeight: '700px'
            }}
          />
        )}
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
