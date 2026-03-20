/**
 * Builds renderable HTML from artifact code based on type.
 * Used for both card previews and full-screen viewer.
 */
export function buildRenderableHTML(code, type) {
  if (!code) return '<html><body></body></html>'

  if (type === 'html') {
    const trimmed = code.trim().toLowerCase()
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) return code
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:Inter,-apple-system,sans-serif;margin:16px;color:#333;}</style>
</head><body>${code}</body></html>`
  }

  if (type === 'react') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"><\/script>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.8.0/Recharts.min.js"><\/script>
<style>body{font-family:Inter,-apple-system,sans-serif;margin:0;}#root{min-height:100vh;}</style>
</head><body><div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment } = React;
${code.replace(/export\s+default\s+/g, 'const __App__ = ').replace(/import\s+.*from\s+['"].*['"];?\n?/g, '')}
try {
  const C = typeof __App__ !== 'undefined' ? __App__ : (typeof App !== 'undefined' ? App : null);
  if (C) ReactDOM.render(React.createElement(C), document.getElementById('root'));
} catch(e) { document.getElementById('root').innerHTML = '<p style="color:red;padding:20px;">Erro: ' + e.message + '</p>'; }
<\/script></body></html>`
  }

  if (type === 'svg') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8f9fa;}</style>
</head><body>${code}</body></html>`
  }

  if (type === 'mermaid') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
<style>body{margin:20px;font-family:Inter,sans-serif;display:flex;justify-content:center;align-items:center;min-height:90vh;}</style>
</head><body><div class="mermaid">${escapeHtml(code)}</div>
<script>mermaid.initialize({startOnLoad:true,theme:'default'});<\/script></body></html>`
  }

  if (type === 'markdown') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<style>
body{font-family:Inter,sans-serif;margin:24px;line-height:1.7;color:#333;max-width:800px;}
h1,h2,h3{color:#1a1a2e;margin-top:1.5em;}
code{background:#f0f0f5;padding:2px 6px;border-radius:4px;font-size:.9em;}
pre{background:#1a1a2e;color:#e4e4ed;padding:16px;border-radius:8px;overflow-x:auto;}
pre code{background:none;color:inherit;padding:0;}
table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;}
th{background:#f5f5f5;font-weight:600;}
blockquote{border-left:4px solid #7c6bf0;margin:16px 0;padding:8px 16px;background:#f8f7ff;}
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
