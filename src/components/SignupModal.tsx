/**
 * SignupModal - Reusable modal prompting users to sign up
 * Used when unauthenticated users try to access protected features
 */

import { useNavigate } from 'react-router-dom'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'add-characters' | 'training' | 'manage-characters'
}

const FEATURE_CONFIG = {
  'add-characters': {
    icon: '➕',
    title: 'Add and Save Characters',
    description: 'Sign in to add characters from your child\'s curriculum and track their learning progress across both drills.',
  },
  'training': {
    icon: '🥋',
    title: 'Start Training with Your Child\'s Characters',
    description: 'Sign in to start training with your child\'s actual characters and save their practice progress.',
  },
  'manage-characters': {
    icon: '📚',
    title: 'Manage Your Child\'s Characters',
    description: 'Sign in to add characters, track progress per drill, and manage pronunciation variants.',
  },
} as const

export function SignupModal({ isOpen, onClose, feature }: SignupModalProps) {
  const navigate = useNavigate()
  const config = FEATURE_CONFIG[feature]

  if (!isOpen) return null

  const handleSignIn = () => {
    navigate('/auth')
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2" aria-hidden="true">
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl font-bold text-gray-900 text-center mb-3">
          {config.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          {config.description}
        </p>

        {/* Action button */}
        <button
          onClick={handleSignIn}
          className="w-full px-6 py-3 bg-ninja-gold text-gray-900 rounded-lg font-bold text-lg hover:bg-ninja-gold-dark transition-colors shadow-lg"
        >
          Sign In
        </button>

        {/* Reassurance text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Free to use. No credit card required.
        </p>
      </div>
    </div>
  )
}
