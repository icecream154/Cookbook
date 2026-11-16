#!/usr/bin/env node
/**
 * 零依赖跨平台（macOS / Windows / Linux）本地预览服务
 * 用途：一键打通 Product/ 下的 Markdown 规格书（含 Mermaid 图表与锚点跳转）与 HTML 可交互微原型双向互跳
 * 启动方式：node preview.js [端口号，默认 8090]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
const DEFAULT_PORT = parseInt(process.argv[2], 10) || 8090;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function renderMarkdownPage(mdText, reqPath) {
  const escapedJson = JSON.stringify(mdText).replace(/<\//g, '<\\/');
  const title = path.basename(reqPath);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Product 本地预览</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: #1e293b; background: #f8fafc; line-height: 1.65; }
    .topbar { position: sticky; top: 0; z-index: 50; background: #0f172a; color: #f8fafc; padding: 10px 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 13px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .topbar a { color: #cbd5e1; text-decoration: none; padding: 4px 10px; border-radius: 6px; background: #1e293b; border: 1px solid #334155; }
    .topbar a:hover { background: #334155; color: #fff; }
    .topbar a.primary { background: #2563eb; border-color: #3b82f6; color: #fff; font-weight: 600; }
    .path-badge { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #94a3b8; font-size: 12px; margin-left: auto; }
    .container { max-width: 1040px; margin: 28px auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px 44px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
    @media (max-width: 768px) { .container { margin: 12px; padding: 20px; } }
    h1, h2, h3, h4 { color: #0f172a; line-height: 1.35; margin-top: 1.5em; margin-bottom: 0.6em; }
    h1 { font-size: 26px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
    h2 { font-size: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    h3 { font-size: 16px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.88em; background: #f1f5f9; color: #0f172a; padding: 2px 6px; border-radius: 4px; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; line-height: 1.5; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { margin: 16px 0; padding: 10px 16px; border-left: 4px solid #3b82f6; background: #eff6ff; color: #1e3a8a; border-radius: 0 8px 8px 0; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; display: block; overflow-x: auto; }
    th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; font-weight: 600; color: #0f172a; white-space: nowrap; }
    tr:nth-child(even) td { background: #fcfcfd; }
    ul, ol { padding-left: 24px; }
    li { margin: 5px 0; }
    .mermaid { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; overflow-x: auto; text-align: center; }
  </style>
</head>
<body>
  <header class="topbar">
    <strong>📦 Product 规格与原型预览工作台</strong>
    <a href="/README.md">🏠 仓库总入口</a>
    <a href="/meta/README.md">📐 meta 元规范</a>
    <a href="/spec/README.md">🍱 Cookbook 规格总览</a>
    <a class="primary" href="/spec/08-verification/prototypes/index.html">▶ 打开可交互原型总控台</a>
    <span class="path-badge">${reqPath}</span>
  </header>
  <main class="container" id="doc">正在渲染文档…</main>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    const RAW_MD = ${escapedJson};

    // Offline built-in lightweight Markdown fallback if CDN is unreachable
    function fallbackParse(md) {
      function inline(s) {
        return s
          .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
          .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
      }
      const lines = md.replace(/\\r\\n/g, '\\n').split('\\n');
      let html = '', inCode = false, codeLang = '', codeBuf = [], inTable = false, tRows = [];
      function flushTable() {
        if (!inTable) return;
        inTable = false;
        if (tRows.length < 2) return;
        const parseRow = r => r.replace(/^\\||\\|$/g, '').split('|').map(c => inline(c.trim()));
        const head = parseRow(tRows[0]);
        const body = tRows.slice(2).map(parseRow);
        html += '<table><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
          body.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
        tRows = [];
      }
      for (const line of lines) {
        if (/^\\s*\`\`\`/.test(line)) {
          flushTable();
          if (!inCode) { inCode = true; codeLang = line.replace(/^\\s*\`\`\`/, '').trim(); codeBuf = []; }
          else {
            inCode = false;
            const body = codeBuf.join('\\n').replace(/&/g, '&amp;').replace(/</g, '&lt;');
            html += codeLang === 'mermaid' ? '<div class="mermaid">' + body + '</div>' : '<pre><code>' + body + '</code></pre>';
          }
          continue;
        }
        if (inCode) { codeBuf.push(line); continue; }
        if (/^\\|.*\\|\\s*$/.test(line.trim())) { inTable = true; tRows.push(line.trim()); continue; }
        flushTable();
        if (!line.trim()) continue;
        if (/^---+$/.test(line.trim())) { html += '<hr/>'; continue; }
        const hm = line.match(/^(#{1,4})\\s+(.*)$/);
        if (hm) { const lv = hm[1].length; html += '<h' + lv + '>' + inline(hm[2]) + '</h' + lv + '>'; continue; }
        if (/^>\\s?/.test(line)) { html += '<blockquote>' + inline(line.replace(/^>\\s?/, '')) + '</blockquote>'; continue; }
        if (/^\\s*[-*]\\s+/.test(line)) { html += '<ul><li>' + inline(line.replace(/^\\s*[-*]\\s+/, '')) + '</li></ul>'; continue; }
        if (/^\\s*\\d+\\.\\s+/.test(line)) { html += '<ol><li>' + inline(line.replace(/^\\s*\\d+\\.\\s+/, '')) + '</li></ol>'; continue; }
        html += '<p>' + inline(line) + '</p>';
      }
      flushTable();
      return html;
    }

    const el = document.getElementById('doc');
    if (window.marked) {
      const renderer = new marked.Renderer();
      const origCode = renderer.code.bind(renderer);
      renderer.code = function(code, infostring) {
        const text = typeof code === 'object' ? code.text : code;
        const lang = (typeof code === 'object' ? code.lang : infostring) || '';
        if (lang === 'mermaid') {
          const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          return '<div class="mermaid">' + esc + '</div>';
        }
        return origCode(code, infostring);
      };
      el.innerHTML = marked.parse(RAW_MD, { renderer });
    } else {
      el.innerHTML = fallbackParse(RAW_MD);
    }

    if (window.mermaid) {
      mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
      mermaid.run({ querySelector: '.mermaid' }).then(() => {
        if (location.hash) {
          const t = document.getElementById(location.hash.slice(1));
          if (t) t.scrollIntoView();
        }
      });
    } else if (location.hash) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  </script>
</body>
</html>`;
}

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const relPath = urlPath === '/' ? '/spec/08-verification/prototypes/index.html' : urlPath;
    const safeTarget = path.resolve(ROOT, '.' + relPath);

    if (!safeTarget.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    let finalPath = safeTarget;
    if (fs.existsSync(finalPath) && fs.statSync(finalPath).isDirectory()) {
      const idxHtml = path.join(finalPath, 'index.html');
      const idxMd = path.join(finalPath, 'README.md');
      const uIdxMd = path.join(finalPath, '_index.md');
      if (fs.existsSync(idxHtml)) finalPath = idxHtml;
      else if (fs.existsSync(idxMd)) finalPath = idxMd;
      else if (fs.existsSync(uIdxMd)) finalPath = uIdxMd;
    }

    if (!fs.existsSync(finalPath) || !fs.statSync(finalPath).isFile()) {
      // Friendly redirect if someone visits old pre-refactor path /08-verification/...
      const migrated = path.resolve(ROOT, 'spec', '.' + relPath);
      if (migrated.startsWith(ROOT) && fs.existsSync(migrated) && fs.statSync(migrated).isFile()) {
        res.writeHead(302, { Location: '/spec' + relPath });
        res.end();
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + relPath);
      return;
    }

    const ext = path.extname(finalPath).toLowerCase();
    if (ext === '.md') {
      const md = fs.readFileSync(finalPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderMarkdownPage(md, relPath));
      return;
    }

    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(finalPath).pipe(res);
  });
}

function start(port) {
  const server = createServer();
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') start(port + 1);
    else throw err;
  });
  server.listen(port, '127.0.0.1', () => {
    const protoUrl = `http://127.0.0.1:${port}/spec/08-verification/prototypes/index.html`;
    const docUrl = `http://127.0.0.1:${port}/README.md`;
    console.log('\n========================================================');
    console.log('🚀 Product 规格与微原型本地预览服务已启动！');
    console.log(`👉 可交互微原型总控台 : ${protoUrl}`);
    console.log(`👉 文档规范总入口(含图): ${docUrl}`);
    console.log('   (按 Ctrl + C 停止服务)');
    console.log('========================================================\n');

    if (!process.env.NO_OPEN) {
      const cmd = process.platform === 'darwin'
        ? `open "${protoUrl}"`
        : process.platform === 'win32'
          ? `start "" "${protoUrl}"`
          : `xdg-open "${protoUrl}"`;
      exec(cmd, () => {});
    }
  });
}

start(DEFAULT_PORT);
