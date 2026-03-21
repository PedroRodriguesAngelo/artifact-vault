import { useState, useEffect, useRef } from 'react'
import { X, Eye } from 'lucide-react'
import { buildRenderableHTML, sanitizeCode } from '../utils/renderer'

const TYPES = [
  { value: 'html', label: 'HTML' },
  { value: 'react', label: 'React (JSX)' },
  { value: 'svg', label: 'SVG' },
  { value: 'mermaid', label: 'Mermaid' },
  { value: 'markdown', label: 'Markdown' },
]

export default function AddEditModal({ isOpen, artifact, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('html')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [code, setCode] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef(null)

  useEffect(() => {
    if (artifact) {
      setTitle(artifact.title || '')
      setType(artifact.type || 'html')
      setDescription(artifact.description || '')
      setTags((artifact.tags || []).join(', '))
      setCode(artifact.code || '')
    } else {
      setTitle(''); setType('html'); setDescription(''); setTags(''); setCode('')
    }
    setShowPreview(false)
  }, [artifact, isOpen])

  const handlePreview = () => {
    setShowPreview(true)
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.srcdoc = buildRenderableHTML(code, type)
      }
    }, 50)
  }

  const handleSave = () => {
    if (!title.trim() || !code.trim()) return
    onSave({
      title: title.trim(),
      type,
      description: description.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      code: sanitizeCode(code.trim()),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:w-[95vw] sm:max-w-[900px] max-h-[92vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">{artifact ? 'Editar Artefato' : 'Novo Artefato'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-txt2 hover:text-txt hover:bg-surface2 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Title + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-txt2 mb-1.5">Título</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Dashboard de KPIs"
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-txt outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-txt2 mb-1.5">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-txt outline-none focus:border-accent transition-colors"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-txt2 mb-1.5">Descrição (opcional)</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Breve descrição do artefato"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-txt outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-txt2 mb-1.5">Tags (separadas por vírgula)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="dashboard, kpi, energia, BIM"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm text-txt outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-txt2 mb-1.5">Código do Artefato</label>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Cole aqui o código HTML, JSX, SVG ou Mermaid..."
              className="code-textarea w-full bg-surface2 border border-border rounded-lg px-3.5 py-3 text-txt outline-none focus:border-accent transition-colors min-h-[250px] resize-y"
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div>
              <label className="block text-xs font-semibold text-txt2 mb-1.5">Pré-visualização</label>
              <div className="w-full h-80 border border-border rounded-lg bg-white overflow-hidden">
                <iframe
                  ref={previewRef}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-none"
                  title="Preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-border shrink-0 safe-bottom">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-txt2 text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            <Eye size={15} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !code.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/80 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {artifact ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
