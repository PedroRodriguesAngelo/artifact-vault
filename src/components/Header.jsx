import { Search, Plus, Download, Upload } from 'lucide-react'

export default function Header({ search, onSearchChange, onAdd, onImportExport }) {
  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#hg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs><linearGradient id="hg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#7c6bf0"/><stop offset="1" stopColor="#a78bfa"/></linearGradient></defs>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Artifact Vault</span>
          <span className="sm:hidden">ArtVault</span>
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt2" />
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="bg-surface2 border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-txt w-48 md:w-64 outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={onImportExport}
            className="p-2.5 rounded-lg border border-border text-txt2 hover:border-accent hover:text-accent transition-colors"
            title="Importar / Exportar"
          >
            <Download size={18} />
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/80 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt2" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar artefatos..."
            className="bg-surface2 border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-txt w-full outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>
    </header>
  )
}
