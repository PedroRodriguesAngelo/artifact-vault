import { useState, useMemo } from 'react'
import { useArtifacts } from './hooks/useArtifacts'
import { ToastProvider, useToast } from './components/Toast'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ArtifactCard from './components/ArtifactCard'
import EmptyState from './components/EmptyState'
import AddEditModal from './components/AddEditModal'
import ViewModal from './components/ViewModal'
import ImportExportModal from './components/ImportExportModal'
import { exportToJSON, importFromJSON } from './utils/storage'

function AppContent() {
  const { artifacts, add, update, remove, duplicate, importArtifacts } = useArtifacts()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingArtifact, setEditingArtifact] = useState(null)
  const [viewingArtifact, setViewingArtifact] = useState(null)
  const [importExportOpen, setImportExportOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = artifacts
    if (filter !== 'all') list = list.filter(a => a.type === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a => {
        const haystack = `${a.title} ${a.description || ''} ${(a.tags || []).join(' ')}`.toLowerCase()
        return haystack.includes(q)
      })
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [artifacts, filter, search])

  // Add/Edit
  const handleOpenAdd = () => { setEditingArtifact(null); setAddModalOpen(true) }
  const handleEdit = (a) => { setViewingArtifact(null); setEditingArtifact(a); setAddModalOpen(true) }
  const handleSave = (data) => {
    if (editingArtifact) {
      update(editingArtifact.id, data)
      toast('Artefato atualizado!')
    } else {
      add(data)
      toast('Artefato salvo!')
    }
    setAddModalOpen(false)
    setEditingArtifact(null)
  }

  // Delete
  const handleDelete = (id) => {
    if (confirm('Excluir este artefato?')) {
      remove(id)
      toast('Artefato excluído')
    }
  }

  // View
  const handleView = (a) => setViewingArtifact(a)
  const handleDuplicate = () => {
    if (viewingArtifact) {
      duplicate(viewingArtifact.id)
      toast('Artefato duplicado!')
      setViewingArtifact(null)
    }
  }
  const handleCopyCode = () => {
    if (viewingArtifact) {
      navigator.clipboard.writeText(viewingArtifact.code)
      toast('Código copiado!')
    }
  }

  // Import/Export
  const handleExport = () => {
    exportToJSON(artifacts)
    toast('Biblioteca exportada!')
  }
  const handleImport = async (file) => {
    try {
      const data = await importFromJSON(file)
      const count = importArtifacts(data)
      toast(`${count} artefato(s) importado(s)!`)
      setImportExportOpen(false)
    } catch (err) {
      toast('Erro: ' + err.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header
        search={search}
        onSearchChange={setSearch}
        onAdd={handleOpenAdd}
        onImportExport={() => setImportExportOpen(true)}
      />

      <FilterBar
        active={filter}
        onChange={setFilter}
        total={artifacts.length}
        filtered={filtered.length}
      />

      {artifacts.length === 0 ? (
        <EmptyState onAdd={handleOpenAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6 lg:p-8">
          {filtered.map(a => (
            <ArtifactCard
              key={a.id}
              artifact={a}
              onClick={() => handleView(a)}
              onEdit={() => handleEdit(a)}
              onDelete={() => handleDelete(a.id)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && artifacts.length > 0 && (
        <div className="text-center py-16 text-txt2">
          <p className="text-sm">Nenhum artefato encontrado para esse filtro.</p>
        </div>
      )}

      <AddEditModal
        isOpen={addModalOpen}
        artifact={editingArtifact}
        onSave={handleSave}
        onClose={() => { setAddModalOpen(false); setEditingArtifact(null) }}
      />

      <ViewModal
        artifact={viewingArtifact}
        onClose={() => setViewingArtifact(null)}
        onEdit={() => handleEdit(viewingArtifact)}
        onDuplicate={handleDuplicate}
        onCopyCode={handleCopyCode}
      />

      <ImportExportModal
        isOpen={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
