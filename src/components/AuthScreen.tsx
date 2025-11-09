// Authentication Screen - Login and Signup
// Epic 6 Task 6.2.1 - Production Authentication

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type AuthMode = 'login' | 'signup'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        setSuccessMessage('Account created! Please check your email to confirm your account, then log in.')
        setMode('login')
        setPassword('')
      } else {
        // Log in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Check if user has a kid profile, create one if not
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: kids } = await supabase
            .from('kids')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1)

          // If no kid profile exists, create one
          if (!kids || kids.length === 0) {
            const { error: kidError } = await supabase
              .from('kids')
              .insert([{
                owner_id: user.id,
                name: 'My Student', // Default name, can be edited later
                grade_level: 1,
                belt: 'white'
              }])

            if (kidError) {
              console.error('Failed to create kid profile:', kidError)
              // Don't throw - user can create manually later
            }
          }
        }

        // Navigate to dashboard
        navigate('/')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🥋</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hanzi Dojo
          </h1>
          <p className="text-lg text-gray-600">
            漢字道場
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Master Traditional Chinese Characters
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
              placeholder="••••••••"
              disabled={loading}
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-red-600 text-white font-bold text-lg rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span>Loading...</span>
            ) : mode === 'login' ? (
              'Log In'
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Mode Toggle */}
          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-red-600 font-semibold hover:text-red-700"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-red-600 font-semibold hover:text-red-700"
                  disabled={loading}
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to practice diligently and respect the way of the dojo 🥋
          </p>
        </div>
      </div>
    </div>
  )
}
