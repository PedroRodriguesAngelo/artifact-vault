import { Box, Plus } from 'lucide-react'

export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <Box size={64} className="text-txt2/30 mb-5" />
      <h3 className="text-lg font-semibold mb-2">Sua biblioteca está vazia</h3>
      <p className="text-sm text-txt2 mb-6 max-w-sm">
        Cole o código de qualquer artefato gerado pelo Claude para começar a montar sua coleção.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/80 active:scale-95 transition-all"
      >
        <Plus size={16} />
        Adicionar Primeiro Artefato
      </button>
    </div>
  )
}
