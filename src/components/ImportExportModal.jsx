import { useRef } from 'react'
import { X, Upload, Download } from 'lucide-react'

export default function ImportExportModal({ isOpen, onClose, onExport, onImport }) {
  const fileRef = useRef(null)

  if (!isOpen) return null

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) onImport(file)
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold">Importar / Exportar</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-txt2 hover:text-txt hover:bg-surface2 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Import zone */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center text-txt2 hover:border-accent hover:bg-accent/5 transition-all mb-4"
        >
          <Download size={28} className="mx-auto mb-3 opacity-60" />
          <p className="text-sm font-medium">Clique para importar .json</p>
          <p className="text-xs mt-1 opacity-60">Mescla com sua biblioteca existente</p>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />

        {/* Export */}
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/80 active:scale-95 transition-all safe-bottom"
        >
          <Upload size={16} />
          Exportar Biblioteca (.json)
        </button>
      </div>
    </div>
  )
}
