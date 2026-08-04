
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/"
  },
  {
    "renderMode": 1,
    "route": "/login"
  },
  {
    "renderMode": 1,
    "route": "/produtos"
  },
  {
    "renderMode": 1,
    "route": "/relatorios"
  },
  {
    "renderMode": 1,
    "route": "/configuracoes"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 15243, hash: 'f16a3718bb8f33b08c6f3a6c03c20e253b8cc3b0d3120cc7a26dad785bb472ed', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 14514, hash: '86f5c95e7ec4d469b27ae04a462622f3da66789f0b2be247eef060816dc09805', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-AGWBTWIS.css': {size: 1802, hash: 'GTWm+aO5qC0', text: () => import('./assets-chunks/styles-AGWBTWIS_css.mjs').then(m => m.default)}
  },
};
