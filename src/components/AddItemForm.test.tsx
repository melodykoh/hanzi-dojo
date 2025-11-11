import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddItemForm } from './AddItemForm'
import { dictionaryClient } from '../lib/dictionaryClient'
import { supabase } from '../lib/supabase'

vi.mock('../lib/dictionaryLogger', () => ({
  dictionaryLogger: {
    logMissingEntry: vi.fn()
  }
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}))

describe('AddItemForm - multi-pronunciation workflow', () => {
  const userId = 'user-123'
  let entriesUpdateEq: ReturnType<typeof vi.fn>
  let readingInserts: Record<string, unknown>[]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()

    ;(supabase.auth.getUser as unknown as vi.Mock).mockResolvedValue({
      data: { user: { id: userId } }
    })

    readingInserts = []

    const entriesSelectLimit = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const entriesSecondEq = vi.fn(() => ({ limit: entriesSelectLimit }))
    const entriesFirstEq = vi.fn(() => ({ eq: entriesSecondEq }))
    const entriesSelect = vi.fn(() => ({ eq: entriesFirstEq }))

    const entryInsertSingle = vi.fn(() => Promise.resolve({ data: { id: 'entry-1' }, error: null }))
    const entryInsertSelect = vi.fn(() => ({ single: entryInsertSingle }))
    const entriesInsert = vi.fn(() => ({ select: entryInsertSelect }))

    entriesUpdateEq = vi.fn(() => Promise.resolve({ data: null, error: null }))
    const entriesUpdate = vi.fn(() => ({ eq: entriesUpdateEq }))

    const readingsInsertSingle = vi.fn(() => Promise.resolve({ data: { id: 'reading-1' }, error: null }))
    const readingsInsert = vi.fn((payload: Record<string, unknown>) => {
      readingInserts.push(payload)
      return {
        select: () => ({ single: readingsInsertSingle })
      }
    })

    const supabaseFrom = vi.fn((table: string) => {
      if (table === 'entries') {
        return {
          select: entriesSelect,
          insert: entriesInsert,
          update: entriesUpdate
        }
      }
      if (table === 'readings') {
        return {
          insert: readingsInsert
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    ;(supabase as unknown as { from: vi.Mock }).from = supabaseFrom
  })

  afterEach(() => {
    // no-op for now
  })

  it('does not lock pronunciation when variants exist but none selected', async () => {
    const lookupSpy = vi
      .spyOn(dictionaryClient, 'lookup')
      .mockResolvedValue({
        found: true,
        entry: {
          id: 'dict-1',
          simp: '可',
          trad: '可',
          zhuyin: [['ㄎ', 'ㄜ', 'ˇ']],
          pinyin: 'kě',
          meanings: ['can; able'],
          zhuyin_variants: [
            {
              zhuyin: [['ㄎ', 'ㄜ', 'ˋ']],
              pinyin: 'kè',
              meanings: ['customer'],
              context_words: ['顧客']
            }
          ]
        }
      })

    const onSuccess = vi.fn()
    render(<AddItemForm kidId="kid-1" onSuccess={onSuccess} />)

    const input = screen.getByPlaceholderText('Enter Chinese character or word...')
    fireEvent.change(input, { target: { value: '可' } })

    await waitFor(() => expect(lookupSpy).toHaveBeenCalled())

    const addButton = screen.getByRole('button', { name: '➕ Add to Practice List' })
    await waitFor(() => expect(addButton).not.toBeDisabled())

    fireEvent.click(addButton)

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    // No locked_reading_id update should occur until pronunciation confirmed
    expect(entriesUpdateEq).not.toHaveBeenCalled()
    expect(readingInserts[0]).toMatchObject({
      zhuyin: [['ㄎ', 'ㄜ', 'ˇ']]
    })
  })

  it('locks pronunciation once a variant is selected', async () => {
    const lookupSpy = vi
      .spyOn(dictionaryClient, 'lookup')
      .mockResolvedValue({
        found: true,
        entry: {
          id: 'dict-2',
          simp: '刷',
          trad: '刷',
          zhuyin: [['ㄕ', 'ㄨㄚ', 'ˉ']],
          zhuyin_variants: [
            {
              zhuyin: [['ㄕ', 'ㄨㄚ', 'ˉ']],
              pinyin: 'shuā',
              meanings: ['to brush'],
              context_words: ['刷牙']
            },
            {
              zhuyin: [['ㄕ', 'ㄨㄚ', 'ˊ']],
              pinyin: 'shuá',
              meanings: ['to scrub'],
              context_words: ['刷子']
            }
          ]
        }
      })

    const onSuccess = vi.fn()
    render(<AddItemForm kidId="kid-1" onSuccess={onSuccess} />)

    const input = screen.getByPlaceholderText('Enter Chinese character or word...')
    fireEvent.change(input, { target: { value: '刷' } })

    await waitFor(() => expect(lookupSpy).toHaveBeenCalled())

    const variantButton = screen.getByText('Used in: 刷子').closest('button')
    expect(variantButton).toBeTruthy()
    fireEvent.click(variantButton as HTMLButtonElement)

    const addButton = screen.getByRole('button', { name: '➕ Add to Practice List' })
    await waitFor(() => expect(addButton).not.toBeDisabled())

    fireEvent.click(addButton)

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())

    expect(entriesUpdateEq).toHaveBeenCalledTimes(1)
    expect(readingInserts[0]).toMatchObject({
      zhuyin: [['ㄕ', 'ㄨㄚ', 'ˊ']],
      context_words: ['刷子'],
      sense: 'to scrub'
    })
  })
})
