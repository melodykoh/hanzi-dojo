import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DictionaryDemo } from './DictionaryDemo'
import { DictionaryStats } from './DictionaryStats'
import { MissingEntriesView } from './MissingEntriesView'
import { PracticeDemo } from './PracticeDemo'
import { ConnectionStatusBadge, OfflineAwareButton } from './OfflineBlocker'
import { OfflineGuard } from './OfflineModal'
import { AddItemForm } from './AddItemForm'
import { DashboardMetrics } from './DashboardMetrics'
import { DrillSelectionModal } from './DrillSelectionModal'
import { DrillBalanceWidget } from './DrillBalanceWidget'
import { EntryCatalog } from './EntryCatalog'
import { DemoDashboard } from './DemoDashboard'
import { SignupModal } from './SignupModal'
import { supabase } from '../lib/supabase'
import type { PracticeDrill } from '../types'
import type { Session } from '@supabase/supabase-js'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'catalog' | 'practice' | 'demo' | 'stats' | 'missing'>('metrics')
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showDrillSelection, setShowDrillSelection] = useState(false)
  const [catalogRefreshTrigger, setCatalogRefreshTrigger] = useState(0)

  // Auth state
  const [session, setSession] = useState<Session | null>(null)
  const [kidId, setKidId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Signup modal state
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [signupModalFeature, setSignupModalFeature] = useState<'add-characters' | 'training' | 'manage-characters'>('add-characters')

  const navigate = useNavigate()

  const handleLaunchTraining = () => {
    if (!session) {
      // Show signup modal for unauthenticated users
      setSignupModalFeature('training')
      setShowSignupModal(true)
      return
    }

    if (!kidId) {
      alert('Cannot start training: No kid profile loaded')
      return
    }

    setShowDrillSelection(true)
  }

  const handleAddItem = () => {
    if (!session) {
      // Show signup modal for unauthenticated users
      setSignupModalFeature('add-characters')
      setShowSignupModal(true)
      return
    }

    setShowAddItemForm(true)
  }

  const handleDrillSelected = (drill: PracticeDrill) => {
    setShowDrillSelection(false)
    navigate(`/training?drill=${drill}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setKidId(null)
  }

  // Authentication check - NO redirect, allow demo mode
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true)

      try {
        // OPTIMIZATION: Parallelize session + user queries (40% faster: 500ms → 350ms)
        // These queries are independent and can run simultaneously
        const [sessionResult, userResult] = await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.getUser(),
        ])

        const session = sessionResult.data.session
        const user = userResult.data.user
        const userError = userResult.error

        // Early exit if not authenticated
        if (!session || !user || userError) {
          if (userError) {
            console.error('[Dashboard] User auth error:', userError)
          }
          // No session/user - enter demo mode (don't redirect)
          setSession(null)
          setKidId(null)
          setIsLoading(false)
          return
        }

        // User is authenticated - load kid profile
        setSession(session)

        // Kids query still sequential (depends on user.id)
        const { data: kids, error: kidsError } = await supabase
          .from('kids')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)

        if (kidsError) {
          console.error('[Dashboard] Kids query error:', kidsError)
          setAuthError('Failed to load kid profile')
          setIsLoading(false)
          return
        }

        if (kids && kids.length > 0) {
          setKidId(kids[0].id)
        } else {
          // No kid profile found - this shouldn't happen with Migration 012
          setAuthError('No student profile found. Please contact support.')
        }

        setIsLoading(false)
      } catch (error) {
        console.error('[Dashboard] Auth check failed:', error)
        setSession(null)
        setKidId(null)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null)
        setKidId(null)
        setActiveTab('metrics') // Reset to demo view
        setShowAddItemForm(false) // Close any open modals
        setShowDrillSelection(false)
        setShowSignupModal(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-run auth check to load kid profile
        checkAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚔️</div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Auth Error Display */}
      {authError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
          <p className="font-bold">Profile Error</p>
          <p>{authError}</p>
        </div>
      )}

      {/* Header - Ninjago Fire Element Theme */}
      <div className="bg-gradient-to-r from-ninja-red to-ninja-red-dark text-white shadow-2xl relative overflow-hidden">
        {/* Subtle angular background pattern */}
        <div className="absolute inset-0 angular-stripe-fire opacity-30 pointer-events-none" />

        {/* Decorative ninja stars */}
        <div className="absolute top-4 right-4 w-12 h-12 text-ninja-gold opacity-20 ninja-star-spin">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M50,10 L55,40 L85,35 L60,55 L80,80 L50,65 L20,80 L40,55 L15,35 L45,40 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">
          {/* Utility bar - minimal, top right */}
          <div className="flex items-center justify-end gap-3 mb-2 sm:mb-3">
            <ConnectionStatusBadge />
            <button
              onClick={() => navigate('/changelog')}
              className="px-3 py-1.5 text-white text-xs hover:text-ninja-yellow transition-all"
              title="What's New"
            >
              📋 What's New
            </button>
            {session ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-bold hover:bg-opacity-30 transition-all rounded border border-white"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-ninja-gold text-gray-900 text-sm font-black hover:bg-ninja-gold-dark transition-all rounded shadow-lg"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Hero title - dominant */}
          <div className="text-center sm:text-left mb-4 sm:mb-5">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 tracking-wide drop-shadow-lg" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)', lineHeight: '1.1' }}>
              ⚔️ 漢字道場 HANZI DOJO ⚔️
            </h1>
            <p className="text-ninja-yellow font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-wide uppercase drop-shadow-md">
              Master the Art of Hanzi
            </p>
          </div>

          {/* Action Bar - Equal width, prominent */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl">
            <OfflineAwareButton
              onClick={handleAddItem}
              className="ninja-button ninja-button-lightning w-full flex items-center justify-center gap-2 text-base sm:text-lg font-black py-3 px-4"
            >
              <span aria-hidden="true">➕</span>
              <span>Add Item</span>
            </OfflineAwareButton>
            <button
              onClick={handleLaunchTraining}
              className="ninja-button ninja-button-gold w-full flex items-center justify-center gap-2 text-base sm:text-lg font-black py-3 px-4"
            >
              <span aria-hidden="true">🥋</span>
              <span>Train</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Elemental Theme */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 border-b-2 border-ninja-gray overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'text-ninja-red border-b-4 border-ninja-red'
                : 'text-gray-600 hover:text-ninja-black'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'text-ninja-green border-b-4 border-ninja-green'
                : 'text-gray-600 hover:text-ninja-black'
            }`}
          >
            📚 My Characters
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'practice'
                ? 'text-ninja-blue border-b-4 border-ninja-blue'
                : 'text-gray-600 hover:text-ninja-black'
            }`}
          >
            ⚡ Practice Demo
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
              activeTab === 'demo'
                ? 'text-ninja-teal border-b-4 border-ninja-teal'
                : 'text-gray-600 hover:text-ninja-black'
            }`}
          >
            📖 Dictionary
          </button>
          {session && (
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-4 py-2 font-bold transition-all whitespace-nowrap ${
                activeTab === 'missing'
                  ? 'text-ninja-purple border-b-4 border-ninja-purple'
                  : 'text-gray-600 hover:text-ninja-black'
              }`}
            >
              🔍 Missing
            </button>
          )}
          {/* Analytics tab hidden - developer-only metrics (cache hit rates, etc.) */}
          {/* To re-enable: uncomment below */}
          {/*
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Analytics
          </button>
          */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'metrics' && (
          <>
            {session && kidId ? (
              <div className="space-y-6">
                <DrillBalanceWidget kidId={kidId} />
                <DashboardMetrics kidId={kidId} />
              </div>
            ) : (
              <DemoDashboard />
            )}
          </>
        )}

        {/* My Characters Tab */}
        {activeTab === 'catalog' && (
          <>
            {session && kidId ? (
              <EntryCatalog
                kidId={kidId}
                onLaunchTraining={handleLaunchTraining}
                refreshTrigger={catalogRefreshTrigger}
              />
            ) : (
              <div className="flex items-center justify-center py-20 px-4">
                <div className="text-center max-w-2xl">
                  <div className="text-8xl mb-6" aria-hidden="true">
                    📚
                  </div>
                  <h2 className="font-heading text-3xl text-gray-900 mb-3">
                    Manage Your Child's Characters
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Sign in to add characters from your child's curriculum,
                    track progress per drill, and manage pronunciation variants for
                    multi-reading characters.
                  </p>
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-3 bg-ninja-gold text-gray-900 rounded-lg font-bold text-lg hover:bg-ninja-gold-dark transition-colors shadow-lg"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Practice Demo Tab */}
        {activeTab === 'practice' && (
          <OfflineGuard>
            <PracticeDemo />
          </OfflineGuard>
        )}

        {/* Dictionary Tab */}
        {activeTab === 'demo' && <DictionaryDemo />}

        {/* Analytics Tab (hidden) */}
        {activeTab === 'stats' && <DictionaryStats />}

        {/* Missing Entries Tab - hide in demo mode */}
        {activeTab === 'missing' && (
          <>
            {session ? (
              <MissingEntriesView />
            ) : (
              <div className="text-center py-20 px-4">
                <div className="text-6xl mb-4" aria-hidden="true">
                  🔍
                </div>
                <p className="text-gray-600 mb-6">
                  Sign in to view missing dictionary entries
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-6 py-2 bg-ninja-gold text-gray-900 rounded-lg font-bold hover:bg-ninja-gold-dark shadow-lg"
                >
                  Sign In
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Item Form Modal */}
      {showAddItemForm && kidId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <AddItemForm
              kidId={kidId}
              onSuccess={() => {
                setShowAddItemForm(false)
                setCatalogRefreshTrigger(prev => prev + 1)  // Trigger catalog reload
                alert('✅ Item added successfully!')
              }}
              onCancel={() => setShowAddItemForm(false)}
            />
          </div>
        </div>
      )}

      {/* Drill Selection Modal */}
      {showDrillSelection && kidId && (
        <DrillSelectionModal
          kidId={kidId}
          onSelectDrill={handleDrillSelected}
          onCancel={() => setShowDrillSelection(false)}
        />
      )}

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        feature={signupModalFeature}
      />
    </div>
  )
}
