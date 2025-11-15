/**
 * Changelog Page - Displays user-facing changelog
 * Fetches and renders CHANGELOG.md from repo root
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function Changelog() {
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadChangelog() {
      try {
        // Fetch the changelog markdown file from public directory
        const response = await fetch('/CHANGELOG.md')

        if (!response.ok) {
          throw new Error('Failed to load changelog')
        }

        const text = await response.text()
        setMarkdown(text)
      } catch (err) {
        console.error('Error loading changelog:', err)
        setError('Unable to load changelog. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadChangelog()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">📋</div>
          <p className="text-gray-600">Loading changelog...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-ninja-fire-600 text-white rounded-lg hover:bg-ninja-fire-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ninja-red to-ninja-red-dark text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
            📋 What's New
          </h1>
          <p className="text-lg text-white text-opacity-90">
            Recent updates and improvements to Hanzi Dojo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <MarkdownRenderer content={markdown} />
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-ninja-fire-600 hover:text-ninja-fire-700 font-medium flex items-center gap-2 mx-auto"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple markdown renderer
 * Handles basic markdown formatting without external dependencies
 */
function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown to HTML conversion
  const renderMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-heading font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-200">
            {line.replace('## ', '')}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl font-heading font-bold text-gray-900 mb-6">
            {line.replace('# ', '')}
          </h1>
        )
      }
      // Horizontal rule
      else if (line.startsWith('---')) {
        elements.push(<hr key={key++} className="my-8 border-gray-300" />)
      }
      // List items
      else if (line.startsWith('- ')) {
        const listItems: string[] = []
        let j = i
        while (j < lines.length && lines[j].startsWith('- ')) {
          listItems.push(lines[j].replace('- ', ''))
          j++
        }
        elements.push(
          <ul key={key++} className="list-disc list-inside space-y-2 my-4 text-gray-700">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ul>
        )
        i = j - 1
      }
      // Paragraphs
      else if (line.trim().length > 0 && !line.startsWith('*')) {
        elements.push(
          <p key={key++} className="text-gray-700 my-3" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        )
      }
      // Empty lines
      else if (line.trim().length === 0) {
        // Skip empty lines (handled by spacing)
        continue
      }
    }

    return elements
  }

  // Format inline markdown (bold, italic, code, links)
  const formatInlineMarkdown = (text: string): string => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-ninja-fire-600">$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-ninja-fire-600 hover:text-ninja-fire-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
  }

  return <div className="space-y-2">{renderMarkdown(content)}</div>
}
