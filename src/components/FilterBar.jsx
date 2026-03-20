const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'html', label: 'HTML' },
  { key: 'react', label: 'React' },
  { key: 'svg', label: 'SVG' },
  { key: 'mermaid', label: 'Mermaid' },
  { key: 'markdown', label: 'Markdown' },
]

export default function FilterBar({ active, onChange, total, filtered }) {
  return (
    <div className="flex items-center gap-2 px-4 md:px-8 py-3 border-b border-border overflow-x-auto scrollbar-none">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all
            ${active === f.key
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-txt2 hover:border-accent/50 hover:text-txt'
            }`}
        >
          {f.label}
        </button>
      ))}
      <span className="ml-auto shrink-0 text-xs text-txt2">
        {filtered} de {total}
      </span>
    </div>
  )
}
