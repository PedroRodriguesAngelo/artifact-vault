/**
 * Builds renderable HTML from artifact code based on type.
 * Used for both card previews and full-screen viewer.
 *
 * Princípio: renderizar o código EXATAMENTE como veio do Claude,
 * sem injetar estilos que possam sobrescrever os do artefato original.
 */
export function buildRenderableHTML(code, type) {
  if (!code) return '<html><body></body></html>'

  if (type === 'html') {
    const trimmed = code.trim().toLowerCase()
    // Se o código já é um documento HTML completo, garante viewport meta para mobile
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
      let result = code
      // Injeta viewport se não tiver
      if (!result.includes('viewport')) {
        result = result.replace(/<head([^>]*)>/i, '<head$1><meta name="viewport" content="width=device-width, initial-scale=1.0">')
      }
      // Força light mode para renderizar como o Claude (evita dark mode do sistema)
      if (!result.includes('color-scheme')) {
        result = result.replace(/<head([^>]*)>/i, '<head$1><meta name="color-scheme" content="light"><style>:root{color-scheme:light;}</style>')
      }
      return result
    }
    // Fragmento HTML: wrapper mínimo sem estilos invasivos
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><style>:root{color-scheme:light;}</style></head><body>${code}</body></html>`
  }

  if (type === 'react') {
    // Processa imports para extrair dependências usadas
    const usesLucide = /from\s+['"]lucide-react['"]/.test(code)
    const usesRecharts = /from\s+['"]recharts['"]/.test(code)
    const usesMathJS = /from\s+['"]mathjs['"]/.test(code)
    const usesD3 = /from\s+['"]d3['"]/.test(code)
    const usesPlotly = /from\s+['"]plotly['"]/.test(code)
    const usesThree = /from\s+['"]three['"]/.test(code)
    const usesLodash = /from\s+['"]lodash['"]/.test(code)
    const usesTone = /from\s+['"]tone['"]/.test(code)

    // CDN scripts condicionais
    const cdnScripts = [
      usesLucide ? '<script src="https://unpkg.com/lucide-react@0.383.0/dist/umd/lucide-react.min.js"><\\/script>' : '',
      usesRecharts ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.8.0/Recharts.min.js"><\\/script>' : '',
      usesMathJS ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.2.1/math.min.js"><\\/script>' : '',
      usesD3 ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"><\\/script>' : '',
      usesPlotly ? '<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"><\\/script>' : '',
      usesThree ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>' : '',
      usesLodash ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"><\\/script>' : '',
      usesTone ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"><\\/script>' : '',
    ].filter(Boolean).join('\n')

    // Limpa imports, preservando todo o resto do código
    let processedCode = code
      .replace(/import\s+\{[^}]*\}\s+from\s+['"]react['"]\s*;?\n?/g, '')
      .replace(/import\s+React\s*,?\s*\{?[^}]*\}?\s*from\s+['"]react['"]\s*;?\n?/g, '')
      .replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '')
      .replace(/import\s+\w+\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '')
      .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '')

    // Trata export default: captura o nome do componente para referência
    // "export default function App()" → "function App()" e marca App como componente
    let componentName = null
    processedCode = processedCode.replace(/export\s+default\s+function\s+(\w+)/g, (_, name) => {
      componentName = name
      return 'function ' + name
    })
    processedCode = processedCode.replace(/export\s+default\s+/g, 'const __DefaultExport__ = ')

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"><\/script>
<script src="https://cdn.tailwindcss.com"><\/script>
${cdnScripts}
<style>:root{color-scheme:light;}body{margin:0;}#root{min-height:100vh;}</style>
</head><body><div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment, forwardRef, memo, lazy, Suspense } = React;
${usesLucide ? 'const lucideReact = window.lucideReact || {};' : ''}
${usesRecharts ? 'const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, Treemap, Funnel, FunnelChart } = window.Recharts || {};' : ''}
${processedCode}
try {
  const C = ${componentName ? `typeof ${componentName} !== 'undefined' ? ${componentName} : null` : "typeof __DefaultExport__ !== 'undefined' ? __DefaultExport__ : (typeof App !== 'undefined' ? App : null)"};
  if (C) {
    const root = ReactDOM.createRoot ? ReactDOM.createRoot(document.getElementById('root')) : null;
    if (root) { root.render(React.createElement(C)); }
    else { ReactDOM.render(React.createElement(C), document.getElementById('root')); }
  }
} catch(e) { document.getElementById('root').innerHTML = '<pre style="color:#ef4444;padding:20px;font-size:14px;">Erro: ' + e.message + '\\n\\n' + e.stack + '</pre>'; }
<\/script></body></html>`
  }

  if (type === 'svg') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<style>:root{color-scheme:light;}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style>
</head><body>${code}</body></html>`
  }

  if (type === 'mermaid') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
<style>:root{color-scheme:light;}body{margin:20px;display:flex;justify-content:center;align-items:center;min-height:90vh;background:#fff;}</style>
</head><body><div class="mermaid">${escapeHtml(code)}</div>
<script>mermaid.initialize({startOnLoad:true,theme:'dark'});<\/script></body></html>`
  }

  if (type === 'markdown') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<style>
:root{color-scheme:light;}
body{font-family:Inter,-apple-system,sans-serif;margin:24px;line-height:1.7;max-width:800px;background:#fff;color:#1a1a2e;}
h1,h2,h3{margin-top:1.5em;}
code{background:rgba(127,127,127,0.15);padding:2px 6px;border-radius:4px;font-size:.9em;}
pre{background:#1a1a2e;color:#e4e4ed;padding:16px;border-radius:8px;overflow-x:auto;}
pre code{background:none;color:inherit;padding:0;}
table{border-collapse:collapse;width:100%;}th,td{border:1px solid rgba(127,127,127,0.3);padding:8px 12px;text-align:left;}
th{font-weight:600;}
blockquote{border-left:4px solid #7c6bf0;margin:16px 0;padding:8px 16px;opacity:0.85;}
img{max-width:100%;border-radius:8px;}
a{color:#7c6bf0;}
</style></head><body><div id="md"></div>
<script>document.getElementById('md').innerHTML = marked.parse(${JSON.stringify(code)});<\/script></body></html>`
  }

  return `<html><body><pre style="padding:16px;font-family:monospace;white-space:pre-wrap;">${escapeHtml(code)}</pre></body></html>`
}

function escapeHtml(s) {
  const d = document.createElement('div')
  d.textContent = s || ''
  return d.innerHTML
}
