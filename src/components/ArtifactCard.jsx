import { useEffect, useRef } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { buildRenderableHTML } from '../utils/renderer'

const BADGE_COLORS = {
  html: 'bg-orange-500 text-white',
  react: 'bg-cyan-400 text-black',
  svg: 'bg-amber-400 text-black',
  mermaid: 'bg-pink-500 text-white',
  markdown: 'bg-emerald-400 text-black',
}

export default function ArtifactCard({ artifact, onClick, onEdit, onDelete }) {
  const iframeRef = useRef(null)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildRenderableHTML(artifact.code, artifact.type)
    }
  }, [artifact.code, artifact.type])

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div
      onClick={onClick}
      className="group bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 active:scale-[0.98]"
    >
      {/* Preview */}
      <div className="relative h-44 bg-[#0d0d12] border-b border-border overflow-hidden">
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          className="w-[200%] h-[200%] border-none origin-top-left scale-50 pointer-events-none"
          title={artifact.title}
        />

        {/* Type Badge */}
        <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${BADGE_COLORS[artifact.type] || 'bg-gray-500 text-white'}`}>
          {artifact.type}
        </span>

        {/* Hover Actions */}
        <div className="absolute top-2.5 left-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="w-7 h-7 rounded-md bg-black/70 text-txt flex items-center justify-center hover:bg-accent transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="w-7 h-7 rounded-md bg-black/70 text-txt flex items-center justify-center hover:bg-red-500 transition-colors"
            title="Excluir"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate">{artifact.title}</h3>
        {artifact.description && (
          <p className="text-xs text-txt2 mt-1 line-clamp-2 leading-relaxed">{artifact.description}</p>
        )}
        {artifact.tags?.length > 0 && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {artifact.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-surface2 text-txt2 border border-border">
                {tag}
              </span>
            ))}
            {artifact.tags.length > 4 && (
              <span className="text-[10px] text-txt2">+{artifact.tags.length - 4}</span>
            )}
          </div>
        )}
        <p className="text-[11px] text-txt2/60 mt-2">{formatDate(artifact.createdAt)}</p>
      </div>
    </div>
  )
}
