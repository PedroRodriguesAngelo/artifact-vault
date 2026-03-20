import { useState, useEffect, useRef } from 'react'
import { X, Pencil, Copy, Code, Monitor, Maximize2 } from 'lucide-react'
import { buildRenderableHTML } from '../utils/renderer'

export default function ViewModal({ artifact, onClose, onEdit, onDuplicate, onCopyCode }) {
  const [tab, setTab] = useState('render')
  const frameRef = useRef(null)

  useEffect(() => {
    setTab('render')
    if (frameRef.current && artifact) {
      frameRef.current.srcdoc = buildRenderableHTML(artifact.code, artifact.type)
    }
  }, [artifact])

  if (!artifact) return null

  const openFullscreen = () => {
    const w = window.open('', '_blank')
    w.document.write(buildRenderableHTML(artifact.code, artifact.type))
    w.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:w-[96vw] sm:max-w-[1200px] max-h-[94vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <h2 className="text-base font-semibold truncate mr-4">{artifact.title}</h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onEdit} className="p-2 rounded-lg text-txt2 hover:text-accent hover:bg-surface2 transition-colors" title="Editar">
              <Pencil size={15} />
            </button>
            <button onClick={onDuplicate} className="p-2 rounded-lg text-txt2 hover:text-accent hover:bg-surface2 transition-colors" title="Duplicar">
              <Copy size={15} />
            </button>
            <button onClick={onCopyCode} className="p-2 rounded-lg text-txt2 hover:text-accent hover:bg-surface2 transition-colors" title="Copiar Código">
              <Code size={15} />
            </button>
            <button onClick={openFullscreen} className="p-2 rounded-lg text-txt2 hover:text-accent hover:bg-surface2 transition-colors" title="Tela Cheia">
              <Maximize2 size={15} />
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button onClick={onClose} className="p-2 rounded-lg text-txt2 hover:text-txt hover:bg-surface2 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5 shrink-0">
          <button
            onClick={() => setTab('render')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === 'render' ? 'border-accent text-accent' : 'border-transparent text-txt2 hover:text-txt'}`}
          >
            <Monitor size={14} />
            Renderizado
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === 'code' ? 'border-accent text-accent' : 'border-transparent text-txt2 hover:text-txt'}`}
          >
            <Code size={14} />
            Código
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'render' && (
            <div className="w-full rounded-lg border border-border overflow-hidden" style={{ height: 'min(600px, 70vh)' }}>
              <iframe
                ref={frameRef}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-none"
                title={artifact.title}
              />
            </div>
          )}
          {tab === 'code' && (
            <pre className="bg-[#0d0d14] border border-border rounded-lg p-4 text-xs leading-relaxed text-[#c9d1d9] overflow-auto font-mono max-h-[70vh] whitespace-pre-wrap break-words">
              {artifact.code}
            </pre>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-border text-[11px] text-txt2/60 shrink-0 safe-bottom">
          <span className="uppercase font-bold tracking-wider">{artifact.type}</span>
          {artifact.tags?.length > 0 && (
            <>
              <span>·</span>
              <span>{artifact.tags.join(', ')}</span>
            </>
          )}
          <span className="ml-auto">
            {new Date(artifact.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
