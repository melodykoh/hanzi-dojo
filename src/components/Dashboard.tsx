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
import { supabase } from '../lib/supabase'
import type { PracticeDrill } from '../types'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'catalog' | 'practice' | 'demo' | 'stats' | 'missing'>('metrics')
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [showDrillSelection, setShowDrillSelection] = useState(false)
  const [catalogRefreshTrigger, setCatalogRefreshTrigger] = useState(0)

  const [kidId, setKidId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const navigate = useNavigate()

  const handleLaunchTraining = () => {
    if (!kidId) {
      alert('Cannot start training: No kid profile loaded')
      return
    }
    setShowDrillSelection(true)
  }

  const handleDrillSelected = (drill: PracticeDrill) => {
    setShowDrillSelection(false)
    navigate(`/training?drill=${drill}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  // Authentication check - redirect to /auth if not logged in
  useEffect(() => {
    async function checkAuth() {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // No session - redirect to auth screen
        navigate('/auth')
        return
      }

      // Load kid profile for authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('[Dashboard] User auth error:', userError)
        navigate('/auth')
        return
      }

      // Get kid profile
      const { data: kids, error: kidsError } = await supabase
        .from('kids')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)

      if (kidsError) {
        console.error('[Dashboard] Kids query error:', kidsError)
        setAuthError('Failed to load kid profile')
        return
      }

      if (kids && kids.length > 0) {
        setKidId(kids[0].id)
      } else {
        // No kid profile found - this shouldn't happen if AuthScreen creates one
        setAuthError('No student profile found. Please contact support.')
      }
    }

    checkAuth()
  }, [navigate])

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
          <div className="flex items-center justify-end gap-2 mb-2 sm:mb-3">
            <ConnectionStatusBadge />
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-ninja-black bg-opacity-50 text-white text-xs font-bold hover:bg-opacity-70 transition-all rounded border border-white border-opacity-30"
            >
              Sign Out
            </button>
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto sm:mx-0">
            <OfflineAwareButton
              onClick={() => setShowAddItemForm(true)}
              disabled={!kidId}
              className="ninja-button ninja-button-lightning disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-black py-2.5"
            >
              <span aria-hidden="true">➕</span>
              <span>Add Item</span>
            </OfflineAwareButton>
            <button
              onClick={handleLaunchTraining}
              disabled={!kidId}
              className="ninja-button ninja-button-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg font-black py-2.5"
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
        {activeTab === 'metrics' && kidId && (
          <div className="space-y-6">
            <DrillBalanceWidget kidId={kidId} />
            <DashboardMetrics kidId={kidId} />
          </div>
        )}
        {activeTab === 'metrics' && !kidId && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading kid profile...</p>
          </div>
        )}
        {activeTab === 'catalog' && kidId && (
          <EntryCatalog 
            kidId={kidId} 
            onLaunchTraining={handleLaunchTraining}
            refreshTrigger={catalogRefreshTrigger}
          />
        )}
        {activeTab === 'catalog' && !kidId && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading kid profile...</p>
          </div>
        )}
        {activeTab === 'practice' && (
          <OfflineGuard>
            <PracticeDemo />
          </OfflineGuard>
        )}
        {activeTab === 'demo' && <DictionaryDemo />}
        {activeTab === 'stats' && <DictionaryStats />}
        {activeTab === 'missing' && <MissingEntriesView />}
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
    </div>
  )
}
