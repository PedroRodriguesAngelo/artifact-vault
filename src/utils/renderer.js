/**
 * Builds renderable HTML from artifact code based on type.
 *
 * FILOSOFIA: O Vault é um servidor de artefatos, não um processador.
 * - HTML completo: vai direto, SEM MODIFICAÇÃO ALGUMA.
 * - React/JSX: recebe wrapper mínimo que replica o ambiente do Claude.
 * - SVG/Mermaid/Markdown: wrapper mínimo necessário.
 *
 * A única transformação permitida é sanitizeCode() para corrigir
 * autocorreção do iOS (en-dash → double-hyphen, smart quotes → retas).
 */
export function buildRenderableHTML(code, type) {
  if (!code) return '<html><body></body></html>'

  // Sanitiza autocorreção do iOS/macOS antes de qualquer processamento
  code = sanitizeCode(code)

  // ===== HTML =====
  // Código HTML do Claude é um documento completo e auto-suficiente.
  // Passa direto. Sem injetar nada. Sem modificar nada.
  if (type === 'html') {
    return code
  }

  // ===== REACT / JSX =====
  // Claude gera componentes JSX. Precisamos do mesmo ambiente que o Claude usa:
  // React 18 + ReactDOM + Babel (client-side) + Tailwind CDN + libs opcionais.
  if (type === 'react') {
    return buildReactHTML(code)
  }

  // ===== SVG =====
  if (type === 'svg') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}</style>
</head><body>${code}</body></html>`
  }

  // ===== MERMAID =====
  if (type === 'mermaid') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
<style>body{margin:20px;display:flex;justify-content:center;align-items:center;min-height:90vh;}</style>
</head><body><div class="mermaid">${escapeHtml(code)}</div>
<script>mermaid.initialize({startOnLoad:true,theme:'default'});<\/script></body></html>`
  }

  // ===== MARKDOWN =====
  if (type === 'markdown') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<style>
body{font-family:system-ui,-apple-system,sans-serif;margin:24px;line-height:1.7;max-width:800px;}
h1,h2,h3{margin-top:1.5em;}
code{background:rgba(127,127,127,0.15);padding:2px 6px;border-radius:4px;font-size:.9em;}
pre{background:#1a1a2e;color:#e4e4ed;padding:16px;border-radius:8px;overflow-x:auto;}
pre code{background:none;color:inherit;padding:0;}
table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;}
th{font-weight:600;}
blockquote{border-left:4px solid #7c6bf0;margin:16px 0;padding:8px 16px;opacity:0.85;}
img{max-width:100%;border-radius:8px;}
a{color:#7c6bf0;}
</style></head><body><div id="md"></div>
<script>document.getElementById('md').innerHTML = marked.parse(${JSON.stringify(code)});<\/script></body></html>`
  }

  // Fallback: texto puro
  return `<html><body><pre style="padding:16px;font-family:monospace;white-space:pre-wrap;">${escapeHtml(code)}</pre></body></html>`
}

/**
 * Constrói HTML para artefatos React/JSX.
 * Replica o ambiente do Claude: React 18 + Babel standalone + Tailwind CDN.
 */
function buildReactHTML(code) {
  // Detecta bibliotecas usadas nos imports
  const libs = {
    lucide: /from\s+['"]lucide-react['"]/.test(code),
    recharts: /from\s+['"]recharts['"]/.test(code),
    mathjs: /from\s+['"]mathjs['"]/.test(code),
    d3: /from\s+['"]d3['"]/.test(code),
    plotly: /from\s+['"]plotly['"]/.test(code),
    three: /from\s+['"]three['"]/.test(code),
    lodash: /from\s+['"]lodash['"]/.test(code),
    tone: /from\s+['"]tone['"]/.test(code),
    chartjs: /from\s+['"]chart\.js['"]/.test(code),
    papaparse: /from\s+['"]papaparse['"]/.test(code),
    tensorflow: /from\s+['"]tensorflow['"]/.test(code),
  }

  // CDN scripts condicionais
  const cdnMap = {
    lucide: 'https://unpkg.com/lucide-react@0.383.0/dist/umd/lucide-react.min.js',
    recharts: 'https://cdnjs.cloudflare.com/ajax/libs/recharts/2.8.0/Recharts.min.js',
    mathjs: 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.2.1/math.min.js',
    d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
    plotly: 'https://cdn.plot.ly/plotly-2.27.0.min.js',
    three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
    tone: 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
    chartjs: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
    papaparse: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
    tensorflow: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js',
  }

  const cdnScripts = Object.entries(libs)
    .filter(([, used]) => used)
    .map(([name]) => `<script src="${cdnMap[name]}"><\/script>`)
    .join('\n')

  // Remove todos os imports (serão fornecidos via globals)
  let processed = code
    .replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '')

  // Captura nome do componente exportado
  let componentName = null

  // export default function ComponentName
  processed = processed.replace(/export\s+default\s+function\s+(\w+)/g, (_, name) => {
    componentName = name
    return 'function ' + name
  })

  // export default class ComponentName
  processed = processed.replace(/export\s+default\s+class\s+(\w+)/g, (_, name) => {
    componentName = name
    return 'class ' + name
  })

  // export default <expression>
  processed = processed.replace(/export\s+default\s+/g, 'const __DefaultExport__ = ')

  // Globals para bibliotecas
  const globals = []
  if (libs.lucide) globals.push('const lucideReact = window.lucideReact || {};')
  if (libs.recharts) globals.push('const { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Scatter, ScatterChart, Treemap, Funnel, FunnelChart } = window.Recharts || {};')
  if (libs.d3) globals.push('const d3 = window.d3;')
  if (libs.plotly) globals.push('const Plotly = window.Plotly;')
  if (libs.three) globals.push('const THREE = window.THREE;')
  if (libs.lodash) globals.push('const _ = window._;')
  if (libs.chartjs) globals.push('const Chart = window.Chart;')
  if (libs.papaparse) globals.push('const Papa = window.Papa;')
  if (libs.tensorflow) globals.push('const tf = window.tf;')
  if (libs.mathjs) globals.push('const math = window.math;')
  if (libs.tone) globals.push('const Tone = window.Tone;')

  // Determina qual componente renderizar
  const renderTarget = componentName
    ? `typeof ${componentName} !== 'undefined' ? ${componentName} : null`
    : "typeof __DefaultExport__ !== 'undefined' ? __DefaultExport__ : (typeof App !== 'undefined' ? App : null)"

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"><\/script>
<script src="https://cdn.tailwindcss.com"><\/script>
${cdnScripts}
<style>body{margin:0;}#root{min-height:100vh;}</style>
</head><body><div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Fragment, forwardRef, memo, lazy, Suspense, useId, useLayoutEffect, useImperativeHandle, useDeferredValue, useTransition, useSyncExternalStore } = React;
${globals.join('\n')}
${processed}
try {
  const __Component__ = ${renderTarget};
  if (__Component__) {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(__Component__));
  } else {
    document.getElementById('root').innerHTML = '<div style="padding:20px;color:#888;">Nenhum componente encontrado para renderizar.</div>';
  }
} catch(e) {
  document.getElementById('root').innerHTML = '<pre style="color:#ef4444;padding:20px;font-size:14px;white-space:pre-wrap;">Erro: ' + e.message + '\\n\\n' + e.stack + '</pre>';
}
<\/script></body></html>`
}

/**
 * Sanitiza código colado que sofreu autocorreção do iOS/macOS:
 * - en-dash (–, U+2013) e em-dash (—, U+2014) → double hyphen (--)
 *   quando aparecem em contextos CSS (custom properties, var() refs)
 * - smart quotes (" " ' ') → aspas retas (" ')
 */
export function sanitizeCode(code) {
  return code
    // En-dash/em-dash → double hyphen em QUALQUER contexto
    // (mais agressivo, mas seguro: -- nunca aparece como en-dash intencionalmente em código)
    .replace(/\u2013\u2013/g, '--')  // ––  → --
    .replace(/\u2014/g, '--')         // —   → --
    .replace(/\u2013(?=\w)/g, '--')   // –x  → --x (custom property names like –bg)
    .replace(/\(\u2013/g, '(--')      // (–  → (-- (var references)
    .replace(/:\s*\u2013/g, ': --')   // : – → : -- (property values)
    // Smart quotes → straight quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
}

function escapeHtml(s) {
  const d = document.createElement('div')
  d.textContent = s || ''
  return d.innerHTML
}
