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

  // ⚠️ TEMPORARY: Auto-login with test credentials for Epic 5 testing
  // TODO: Replace with proper login UI in Epic 6
  useEffect(() => {
    async function initAuth() {
      console.log('[Dashboard] Checking auth...')
      
      // Check if already logged in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('[Dashboard] No session, attempting auto-login...')
        // Auto-login with test credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: 'test@hanzidojo.local',
          password: 'testpassword123'
        })
        
        if (error) {
          console.error('[Dashboard] Auto-login failed:', error)
          setAuthError('Failed to login. Please check test account setup.')
          return
        }
        console.log('[Dashboard] Auto-login successful')
      }

      // Load kid from authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('[Dashboard] User auth error:', userError)
        setAuthError('Authentication error')
        return
      }

      if (!user) {
        console.log('[Dashboard] No user logged in')
        setAuthError('Not logged in')
        return
      }

      console.log('[Dashboard] User found:', user.id)

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

      console.log('[Dashboard] Kids query result:', kids)

      if (kids && kids.length > 0) {
        console.log('[Dashboard] Setting kidId:', kids[0].id)
        setKidId(kids[0].id)
      } else {
        console.log('[Dashboard] No kids found for user')
        setAuthError('No kid profile found. Please create one in Supabase.')
      }
    }

    initAuth()
  }, [])

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Auth Error Display */}
      {authError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
          <p className="font-bold">Authentication Error</p>
          <p>{authError}</p>
          <p className="text-sm mt-2">
            Please follow setup instructions in <code>docs/operational/EPIC5_TESTING_SETUP.md</code>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">漢字道場 Hanzi Dojo</h1>
              <p className="text-red-100">Epic 5.5: UX Refinement</p>
            </div>
            <div>
              <ConnectionStatusBadge />
            </div>
          </div>

          {/* Sticky Action Bar */}
          <div className="flex gap-3 flex-wrap">
            <OfflineAwareButton
              onClick={() => setShowAddItemForm(true)}
              disabled={!kidId}
              className="flex-1 min-w-[200px] px-6 py-3 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add Item
            </OfflineAwareButton>
            <button
              onClick={handleLaunchTraining}
              disabled={!kidId}
              className="flex-1 min-w-[200px] px-6 py-3 bg-yellow-400 text-red-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🥋 Launch Training
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Demo/Debug Views Only */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 My Characters
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'practice'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🥋 Practice Demo
          </button>
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
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'demo'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 Dictionary
          </button>
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'missing'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔍 Missing
          </button>
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
