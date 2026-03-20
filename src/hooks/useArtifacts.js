import { useState, useCallback } from 'react'
import { loadArtifacts, saveArtifacts } from '../utils/storage'

export function useArtifacts() {
  const [artifacts, setArtifacts] = useState(() => loadArtifacts())

  const persist = useCallback((next) => {
    setArtifacts(next)
    saveArtifacts(next)
  }, [])

  const add = useCallback((artifact) => {
    const item = {
      ...artifact,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([item, ...artifacts])
    return item
  }, [artifacts, persist])

  const update = useCallback((id, data) => {
    persist(artifacts.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
  }, [artifacts, persist])

  const remove = useCallback((id) => {
    persist(artifacts.filter(a => a.id !== id))
  }, [artifacts, persist])

  const duplicate = useCallback((id) => {
    const original = artifacts.find(a => a.id === id)
    if (!original) return
    const dup = {
      ...original,
      id: crypto.randomUUID(),
      title: original.title + ' (cópia)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    persist([dup, ...artifacts])
  }, [artifacts, persist])

  const importArtifacts = useCallback((imported) => {
    const existing = new Set(artifacts.map(a => a.id))
    const newItems = imported.filter(a => !existing.has(a.id))
    if (newItems.length > 0) {
      persist([...newItems, ...artifacts])
    }
    return newItems.length
  }, [artifacts, persist])

  return { artifacts, add, update, remove, duplicate, importArtifacts, setAll: persist }
}
