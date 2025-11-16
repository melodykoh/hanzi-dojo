import { useState, useEffect } from 'react';
import { useTallyPopup } from 'react-tally';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type FeedbackType = 'bug' | 'feature' | 'general';

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

  // Placeholder form ID - will be replaced with actual Tally form ID
  const formId = 'VLL59J';
  const { open } = useTallyPopup(formId);

  const openFeedbackForm = (type: FeedbackType) => {
    // Gather context
    const context = {
      user_email: user?.email || '',
      user_id: user?.id || 'anonymous',
      user_type: user ? 'authenticated' : 'demo',
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent
    };

    // Open popup with context
    open({
      layout: 'modal',
      width: 600,
      overlay: true,
      emoji: {
        text: type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '💬',
        animation: 'wave'
      },
      // Store context for form to read via URL parameters
      key: JSON.stringify(context),
      onSubmit: (payload) => {
        console.log('Feedback submitted:', payload);
        // Optional: Show success toast notification
      }
    });

    // Store in sessionStorage as backup
    sessionStorage.setItem('tally_context', JSON.stringify(context));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-heading text-gray-900 mb-3">
          Feedback
        </h2>
        <p className="text-lg text-gray-600">
          We'd love to hear from you! Share bugs, ideas, or questions to help us improve Hanzi Dojo.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bug Report Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
          <div className="text-4xl mb-3">🐛</div>
          <h3 className="text-xl font-bold mb-2">Report a Bug</h3>
          <p className="text-gray-600 mb-4">
            Found something broken? Let us know so we can fix it quickly.
          </p>
          <button
            onClick={() => openFeedbackForm('bug')}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Report Bug
          </button>
        </div>

        {/* Feature Request Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ninja-blue">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-xl font-bold mb-2">Request a Feature</h3>
          <p className="text-gray-600 mb-4">
            Have an idea to make Hanzi Dojo better? We're all ears!
          </p>
          <button
            onClick={() => openFeedbackForm('feature')}
            className="w-full px-4 py-2 bg-ninja-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Share Idea
          </button>
        </div>

        {/* General Feedback Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-ninja-purple">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-xl font-bold mb-2">General Feedback</h3>
          <p className="text-gray-600 mb-4">
            Questions, suggestions, or just want to say hi? Reach out!
          </p>
          <button
            onClick={() => openFeedbackForm('general')}
            className="w-full px-4 py-2 bg-ninja-purple text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Send Feedback
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          🔒 <strong>Privacy:</strong> Your feedback is confidential and will only be used to improve Hanzi Dojo.
          We'll respond to your email if needed, never for marketing.
          Demo users can submit feedback anonymously.
        </p>
      </div>
    </div>
  );
}
