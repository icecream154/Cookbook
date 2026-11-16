#!/usr/bin/env node
/**
 * Product 规格与元规范 IDE 级全库预览服务（零外部依赖 · 零 spec 新增文件）
 * 特性：
 *   1. 仿 VS Code / Cursor 左侧可拖拽宽度文件资源管理器（带层级缩进引导线、展开折叠、实时搜索过滤）
 *   2. 在单一网页内按完整物理目录结构渲染全部 Markdown 规格书与 Mermaid 图表（支持“全库连贯长卷”与“单文件聚焦”一键切换）
 *   3. 基于 .md 原生相对路径与 #anchor 锚点的页内精准平滑跳转、目标高亮与“返回原阅读处”胶囊
 *   4. 右侧动态跟随“本篇大纲 (On This Page)”目录
 * 启动：node preview.js [端口，默认 8090]
 * 导出：node preview.js --export-spec [输出文件.html]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = __dirname;
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

const CN_NUM = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
const DOMAIN_FILE_ORDER = { 'terms.md': 1, 'entities.md': 2, 'enums.md': 3 };

function extractDocMeta(absPath, name) {
  let title = name;
  let shortDesc = '';
  let orderHint = 500;
  try {
    const head = fs.readFileSync(absPath, 'utf8').slice(0, 900);
    const h1 = head.match(/^#\s+(.+)$/m);
    if (h1) {
      title = h1[1]
        .replace(/<a\s+id="[^"]*"><\/a>/gi, '')
        .replace(/`/g, '')
        .trim();
      shortDesc = title
        .replace(/^[0-9]+(-[0-9]+)?\.\s*/, '')
        .replace(/^【[^】]+】/, '')
        .replace(/（[^）]*）|\([^)]*\)/g, '')
        .replace(/^[^：:]{2,14}[：:]\s*/, '')
        .trim();
    }
    const fileLeadNum = name.match(/^(\d+)/);
    if (name === 'README.md' || name === '_index.md') {
      orderHint = 0;
    } else if (fileLeadNum) {
      orderHint = parseInt(fileLeadNum[1], 10);
    } else if (DOMAIN_FILE_ORDER[name]) {
      orderHint = DOMAIN_FILE_ORDER[name];
    } else {
      const secNum = title.match(/^0?\d+-(\d+)/);
      const pageNum = title.match(/PAGE-[A-Z]+-(\d+)/);
      const groupCn = title.match(/(?:阶段|簇)([一二三四五六七八九十])/);
      if (secNum) orderHint = 10 + parseInt(secNum[1], 10);
      else if (pageNum) orderHint = 20 + parseInt(pageNum[1], 10);
      else if (groupCn && CN_NUM[groupCn[1]]) orderHint = 30 + CN_NUM[groupCn[1]];
    }
  } catch (_) {}
  return { title, shortDesc, orderHint };
}

function getDirOrderHint(absDir, dirName) {
  const leadNum = dirName.match(/^(\d+)/);
  if (leadNum) return parseInt(leadNum[1], 10);
  for (const idxName of ['README.md', '_index.md']) {
    const idxPath = path.join(absDir, idxName);
    if (fs.existsSync(idxPath)) {
      const { title } = extractDocMeta(idxPath, idxName);
      const secNum = title.match(/^0?\d+-(\d+)/);
      if (secNum) return 10 + parseInt(secNum[1], 10);
    }
  }
  return 500;
}

function scanMarkdownTree(targetSubdir) {
  const baseAbs = targetSubdir ? path.join(ROOT, targetSubdir) : ROOT;
  const docs = [];

  function walkDir(absDir, relDir) {
    const rawEntries = fs.readdirSync(absDir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith('.'));

    const fileNodes = [];
    const dirNodes = [];

    for (const entry of rawEntries) {
      const childAbs = path.join(absDir, entry.name);
      const childRel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        // 在根视图仅聚合根文档；spec 与 meta 各自有专属工作区页签
        if (!targetSubdir && (entry.name === 'spec' || entry.name === 'meta')) continue;
        const sub = walkDir(childAbs, childRel);
        if (sub.mdCount > 0) {
          dirNodes.push({
            kind: 'dir',
            name: entry.name,
            relPath: childRel,
            orderHint: getDirOrderHint(childAbs, entry.name),
            mdCount: sub.mdCount,
            children: sub.children
          });
        }
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        const { title, shortDesc, orderHint } = extractDocMeta(childAbs, entry.name);
        const content = fs.readFileSync(childAbs, 'utf8');
        fileNodes.push({
          kind: 'file',
          name: entry.name,
          relPath: childRel,
          title,
          shortDesc,
          orderHint,
          content
        });
      }
    }

    const combined = [...fileNodes, ...dirNodes].sort((a, b) => {
      if (a.orderHint !== b.orderHint) return a.orderHint - b.orderHint;
      if (a.kind !== b.kind) return a.kind === 'file' ? -1 : 1;
      return a.name.localeCompare(b.name, 'zh-CN', { numeric: true });
    });

    let mdCount = 0;
    for (const item of combined) {
      mdCount += item.kind === 'file' ? 1 : item.mdCount;
    }
    return { mdCount, children: combined };
  }

  const rootTree = walkDir(baseAbs, '');

  function collectLinear(nodes) {
    for (const n of nodes) {
      if (n.kind === 'file') {
        docs.push({
          relPath: n.relPath,
          name: n.name,
          title: n.title,
          shortDesc: n.shortDesc,
          dirPath: path.posix.dirname(n.relPath) === '.' ? '' : path.posix.dirname(n.relPath),
          content: n.content
        });
      } else {
        collectLinear(n.children);
      }
    }
  }
  collectLinear(rootTree.children);

  function stripContent(nodes) {
    return nodes.map((n) => (
      n.kind === 'file'
        ? { kind: 'file', name: n.name, relPath: n.relPath, title: n.title, shortDesc: n.shortDesc }
        : { kind: 'dir', name: n.name, relPath: n.relPath, mdCount: n.mdCount, children: stripContent(n.children) }
    ));
  }

  return {
    rootName: targetSubdir || 'Product',
    urlBase: targetSubdir ? `/${targetSubdir}` : '',
    totalDocs: docs.length,
    tree: stripContent(rootTree.children),
    docs
  };
}

function renderWorkspacePage(targetSubdir, initialDocRel = '') {
  const bundle = scanMarkdownTree(targetSubdir);
  const safeBundleJson = JSON.stringify(bundle).replace(/<\//g, '<\\/');
  const safeInitialDoc = JSON.stringify(initialDocRel || '');
  const docTitle = targetSubdir === 'spec'
    ? 'Cookbook Spec · 产品规格全库工作台'
    : targetSubdir === 'meta'
      ? 'Meta Framework · 产品文档元规范工作台'
      : 'Product Engineering · 仓库总览';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <style>
    :root {
      color-scheme: light;
      --bg-canvas: #ffffff;
      --bg-sidebar: #f8f9fb;
      --bg-subtle: #f3f4f6;
      --bg-hover: #eef0f4;
      --bg-active: #e8f0fe;
      --ink-1: #111827;
      --ink-2: #374151;
      --ink-3: #6b7280;
      --ink-4: #9ca3af;
      --accent: #2563eb;
      --accent-ink: #1d4ed8;
      --accent-border: #bfdbfe;
      --border: #e5e7eb;
      --border-soft: #f0f1f4;
      --sidebar-w: 292px;
      --toc-w: 224px;
      --header-h: 48px;
      --font-sans: -apple-system, BlinkMacSystemFont, "Inter", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
    body {
      margin: 0;
      font-family: var(--font-sans);
      color: var(--ink-1);
      background: var(--bg-canvas);
      line-height: 1.68;
      font-size: 14.5px;
    }

    /* ── Top Header Bar (Minimal Studio Style) ── */
    .app-header {
      position: sticky;
      top: 0;
      z-index: 200;
      height: var(--header-h);
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: saturate(180%) blur(12px);
      -webkit-backdrop-filter: saturate(180%) blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      gap: 12px;
    }

    .hd-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ink-3);
      cursor: pointer;
      transition: all 0.12s ease;
      padding: 0;
    }
    .icon-btn:hover { background: var(--bg-subtle); color: var(--ink-1); }

    /* Workspace Switcher Tabs */
    .ws-nav {
      display: inline-flex;
      align-items: center;
      background: var(--bg-subtle);
      padding: 3px;
      border-radius: 8px;
      gap: 2px;
    }
    .ws-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ink-3);
      text-decoration: none;
      transition: all 0.12s ease;
      white-space: nowrap;
    }
    .ws-tab:hover { color: var(--ink-1); }
    .ws-tab.active {
      background: #ffffff;
      color: var(--ink-1);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
    }
    .ws-count {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--ink-4);
      font-weight: 500;
    }
    .ws-tab.active .ws-count { color: var(--accent); }

    /* Center Breadcrumb */
    .hd-crumb {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink-3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      justify-content: center;
    }
    .hd-crumb .crumb-sep { color: var(--ink-4); }
    .hd-crumb .crumb-file { color: var(--ink-1); font-weight: 500; }

    /* Right Controls */
    .hd-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .seg-group {
      display: inline-flex;
      background: var(--bg-subtle);
      padding: 2px;
      border-radius: 7px;
      border: 1px solid var(--border-soft);
    }
    .seg-btn {
      border: none;
      background: transparent;
      color: var(--ink-3);
      font-size: 12px;
      font-weight: 500;
      padding: 4px 9px;
      border-radius: 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }
    .seg-btn:hover { color: var(--ink-1); }
    .seg-btn.active {
      background: #ffffff;
      color: var(--ink-1);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    .proto-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 500;
      color: var(--accent-ink);
      background: #eff6ff;
      border: 1px solid var(--accent-border);
      text-decoration: none;
      transition: all 0.12s;
      white-space: nowrap;
    }
    .proto-link:hover { background: #dbeafe; border-color: #93c5fd; }

    /* ── Three-Pane IDE Layout ── */
    .ide-shell {
      display: grid;
      grid-template-columns: var(--sidebar-w) minmax(0, 1fr) var(--toc-w);
      min-height: calc(100vh - var(--header-h));
      position: relative;
    }
    body.sidebar-collapsed .ide-shell {
      grid-template-columns: 0px minmax(0, 1fr) var(--toc-w);
    }
    body.sidebar-collapsed .ide-sidebar {
      border-right: none;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
    }

    /* ── Left IDE File Explorer ── */
    .ide-sidebar {
      position: sticky;
      top: var(--header-h);
      height: calc(100vh - var(--header-h));
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      user-select: none;
      transition: opacity 0.15s ease;
      z-index: 100;
    }
    .resizer {
      position: absolute;
      top: 0;
      right: -3px;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      z-index: 10;
    }
    .resizer:hover, .resizer.dragging { background: rgba(37, 99, 235, 0.35); }

    .explorer-top {
      padding: 10px 10px 8px;
      border-bottom: 1px solid var(--border-soft);
    }
    .explorer-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px 7px;
    }
    .explorer-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ink-3);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .explorer-actions { display: flex; gap: 2px; }
    .explorer-actions .icon-btn { width: 22px; height: 22px; border-radius: 4px; }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box svg {
      position: absolute;
      left: 8px;
      width: 13px;
      height: 13px;
      color: var(--ink-4);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      height: 29px;
      padding: 0 42px 0 27px;
      font-size: 12px;
      font-family: var(--font-sans);
      color: var(--ink-1);
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 6px;
      outline: none;
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    .search-input::placeholder { color: var(--ink-4); }
    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
    }
    .search-kbd {
      position: absolute;
      right: 6px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--ink-4);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 0 4px;
      line-height: 16px;
      pointer-events: none;
    }
    .search-stat {
      font-size: 11px;
      color: var(--ink-3);
      padding: 5px 4px 0;
      display: none;
    }
    .search-stat.shown { display: block; }

    /* IDE Tree Rows */
    .tree-viewport {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 6px 6px 24px;
    }
    .tree-viewport::-webkit-scrollbar { width: 6px; }
    .tree-viewport::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

    .t-node { margin: 0; }
    .t-row {
      display: flex;
      align-items: center;
      height: 27px;
      padding: 0 6px;
      border-radius: 5px;
      cursor: pointer;
      color: var(--ink-2);
      font-size: 12.5px;
      text-decoration: none;
      gap: 5px;
      white-space: nowrap;
      overflow: hidden;
    }
    .t-row:hover { background: var(--bg-hover); color: var(--ink-1); }
    .t-row.active {
      background: var(--bg-active);
      color: var(--accent-ink);
      font-weight: 500;
    }

    .t-chev {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--ink-4);
      flex-shrink: 0;
      transition: transform 0.14s ease;
    }
    .t-dir:not(.collapsed) > .t-row .t-chev { transform: rotate(90deg); }
    .t-dir.collapsed > .t-children { display: none; }

    .t-ico {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
      color: #64748b;
    }
    .t-dir > .t-row .t-ico { color: #3b82f6; opacity: 0.85; }
    .t-row.active .t-ico { color: var(--accent); }

    .t-name {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: -0.01em;
      flex-shrink: 0;
    }
    .t-dir > .t-row .t-name {
      font-family: var(--font-sans);
      font-weight: 500;
      font-size: 12.5px;
      color: var(--ink-1);
    }
    .t-desc {
      font-size: 11px;
      color: var(--ink-4);
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 4px;
    }
    .t-row.active .t-desc { color: #60a5fa; }
    .t-badge {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--ink-4);
      padding-left: 4px;
    }

    /* VS Code Indent Guides */
    .t-children {
      margin-left: 12px;
      padding-left: 8px;
      border-left: 1px solid #e5e7eb;
    }
    .ide-sidebar:hover .t-children { border-left-color: #d1d5db; }
    .t-hidden { display: none !important; }

    /* ── Center Reading Canvas ── */
    .doc-canvas {
      min-width: 0;
      padding: 28px 48px 110px;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
    }

    /* Subtle Directory Divider in Stream */
    .folder-group { margin-top: 8px; scroll-margin-top: 64px; }
    .folder-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 18px 0 8px;
      margin-top: 12px;
      border-top: 1px solid var(--border);
      color: var(--ink-3);
      font-family: var(--font-mono);
      font-size: 12px;
      cursor: pointer;
      user-select: none;
    }
    .folder-group:first-child > .folder-header { border-top: none; margin-top: 0; padding-top: 0; }
    .folder-header:hover { color: var(--ink-1); }
    .folder-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      padding: 2px 9px;
      border-radius: 6px;
      color: var(--ink-2);
      font-weight: 500;
    }
    .folder-group.folded > .folder-children { display: none; }
    .folder-fold-hint { margin-left: auto; font-family: var(--font-sans); font-size: 11.5px; color: var(--ink-4); }

    /* Document Section */
    .doc-section {
      padding: 26px 0 42px;
      border-bottom: 1px solid var(--border-soft);
      scroll-margin-top: 60px;
    }
    .doc-section.single-hidden { display: none !important; }
    .doc-meta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }
    .doc-filepath {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--ink-3);
      background: var(--bg-subtle);
      padding: 2px 8px;
      border-radius: 5px;
    }
    .doc-meta-actions { display: flex; align-items: center; gap: 6px; opacity: 0.65; transition: opacity 0.15s; }
    .doc-section:hover .doc-meta-actions { opacity: 1; }
    .meta-act-btn {
      border: 1px solid var(--border);
      background: #fff;
      color: var(--ink-3);
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .meta-act-btn:hover { color: var(--accent); border-color: var(--accent-border); background: #eff6ff; }

    /* Jump Target Highlight */
    @keyframes softHighlight {
      0% { background-color: #fef08a; box-shadow: 0 0 0 4px #fef08a; }
      70% { background-color: #fef9c3; box-shadow: 0 0 0 2px #fef9c3; }
      100% { background-color: transparent; box-shadow: none; }
    }
    .jump-flash { animation: softHighlight 2s ease-out; border-radius: 4px; }

    /* ── Refined Markdown Typography (Linear / GitBook Grade) ── */
    .md-prose [id] { scroll-margin-top: 70px; }
    .md-prose h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--ink-1);
      margin: 0 0 16px;
      line-height: 1.32;
    }
    .md-prose h2 {
      font-size: 17.5px;
      font-weight: 650;
      letter-spacing: -0.01em;
      color: var(--ink-1);
      margin: 28px 0 12px;
      padding-bottom: 7px;
      border-bottom: 1px solid var(--border-soft);
      line-height: 1.38;
    }
    .md-prose h3 {
      font-size: 15px;
      font-weight: 600;
      color: var(--ink-1);
      margin: 20px 0 8px;
    }
    .md-prose p { margin: 10px 0; color: var(--ink-2); }
    .md-prose ul, .md-prose ol { margin: 8px 0; padding-left: 22px; color: var(--ink-2); }
    .md-prose li { margin: 4px 0; }
    .md-prose strong { color: var(--ink-1); font-weight: 600; }

    .md-prose a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      transition: border-color 0.12s, background-color 0.12s;
    }
    .md-prose a:hover { border-bottom-color: var(--accent); }
    .md-prose a.in-book-link {
      color: #1d4ed8;
      background: rgba(37, 99, 235, 0.05);
      padding: 1px 4px;
      border-radius: 4px;
    }
    .md-prose a.in-book-link:hover {
      background: rgba(37, 99, 235, 0.12);
      border-bottom-color: transparent;
    }

    .md-prose code {
      font-family: var(--font-mono);
      font-size: 12.5px;
      background: #f3f4f6;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .md-prose pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 18px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 12.5px;
      line-height: 1.55;
      margin: 14px 0;
      border: 1px solid #1e293b;
    }
    .md-prose pre code {
      background: transparent;
      color: inherit;
      border: none;
      padding: 0;
      font-size: inherit;
    }
    .md-prose blockquote {
      margin: 14px 0;
      padding: 10px 16px;
      background: #f8fafc;
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
      color: var(--ink-2);
      font-size: 13.5px;
    }
    .md-prose blockquote p { margin: 4px 0; }
    .md-prose hr {
      border: none;
      border-top: 1px solid var(--border-soft);
      margin: 22px 0;
    }

    /* Crisp Modern Tables */
    .table-wrap {
      width: 100%;
      overflow-x: auto;
      margin: 14px 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
    }
    .md-prose table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
      line-height: 1.55;
    }
    .md-prose th, .md-prose td {
      padding: 9px 13px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--border-soft);
      border-right: 1px solid var(--border-soft);
    }
    .md-prose th:last-child, .md-prose td:last-child { border-right: none; }
    .md-prose tr:last-child td { border-bottom: none; }
    .md-prose th:first-child, .md-prose td:first-child {
      min-width: 118px;
    }
    .md-prose th {
      background: #f9fafb;
      color: var(--ink-2);
      font-weight: 600;
      font-size: 12.5px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }
    .md-prose tbody tr:hover td { background: #fafbfc; }

    /* Mermaid Diagram Card */
    .mermaid {
      background: #fafbfc;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px 16px;
      margin: 16px 0;
      overflow-x: auto;
      text-align: center;
    }

    /* ── Right "On This Page" Outline ── */
    .ide-toc {
      position: sticky;
      top: var(--header-h);
      height: calc(100vh - var(--header-h));
      padding: 24px 16px 24px 8px;
      overflow-y: auto;
      border-left: 1px solid var(--border-soft);
      font-size: 12px;
    }
    .toc-hd {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-3);
      margin-bottom: 10px;
      padding-left: 10px;
    }
    .toc-doc-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-1);
      padding: 0 0 8px 10px;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
      border-left: 1px solid var(--border);
    }
    .toc-item a {
      display: block;
      padding: 4px 8px 4px 11px;
      color: var(--ink-3);
      text-decoration: none;
      line-height: 1.4;
      border-left: 2px solid transparent;
      margin-left: -1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toc-item.lv-3 a { padding-left: 22px; font-size: 11.5px; }
    .toc-item a:hover { color: var(--ink-1); border-left-color: var(--ink-4); }

    /* ── Floating Return Pill ── */
    .return-pill {
      position: fixed;
      right: 28px;
      bottom: 24px;
      z-index: 300;
      background: #111827;
      color: #f9fafb;
      border: 1px solid #374151;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
      border-radius: 99px;
      padding: 6px 8px 6px 14px;
      font-size: 12px;
      display: none;
      align-items: center;
      gap: 8px;
    }
    .return-pill.visible { display: inline-flex; }
    .return-pill .ret-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 99px;
      padding: 4px 11px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
    .return-pill .ret-btn:hover { background: #1d4ed8; }
    .return-pill .ret-close {
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 2px 5px;
      font-size: 13px;
    }

    @media (max-width: 1280px) {
      .ide-shell { grid-template-columns: var(--sidebar-w) minmax(0, 1fr); }
      body.sidebar-collapsed .ide-shell { grid-template-columns: 0px minmax(0, 1fr); }
      .ide-toc { display: none; }
    }
    @media (max-width: 860px) {
      .ide-shell { grid-template-columns: 1fr !important; }
      .hd-crumb { display: none; }
      .ide-sidebar {
        position: fixed;
        left: 0;
        top: var(--header-h);
        width: 292px;
        transform: translateX(-100%);
        transition: transform 0.2s ease;
        box-shadow: 12px 0 28px rgba(0, 0, 0, 0.12);
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      .ide-sidebar.mobile-open { transform: translateX(0); }
      .doc-canvas { padding: 20px 18px 90px; }
    }
  </style>
</head>
<body>
  <header class="app-header">
    <div class="hd-left">
      <button class="icon-btn" id="btnToggleSidebar" title="展开/收起左侧文件树 (⌘B)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      </button>
      <nav class="ws-nav" aria-label="Workspace Switcher">
        <a class="ws-tab ${targetSubdir === 'spec' ? 'active' : ''}" href="/spec">
          <span>spec 业务规格</span>
          ${targetSubdir === 'spec' ? `<span class="ws-count">${bundle.totalDocs}</span>` : ''}
        </a>
        <a class="ws-tab ${targetSubdir === 'meta' ? 'active' : ''}" href="/meta">
          <span>meta 元规范</span>
          ${targetSubdir === 'meta' ? `<span class="ws-count">${bundle.totalDocs}</span>` : ''}
        </a>
        <a class="ws-tab ${!targetSubdir ? 'active' : ''}" href="/README.md">
          <span>仓库导读</span>
        </a>
      </nav>
    </div>

    <div class="hd-crumb" id="headerCrumb"></div>

    <div class="hd-right">
      <div class="seg-group" role="tablist">
        <button class="seg-btn active" id="modeAllBtn" title="在同一页面内按目录结构连续渲染全部 Markdown">全库连贯视图</button>
        <button class="seg-btn" id="modeSingleBtn" title="仅聚焦渲染左侧选中的单个文件">单文件视图</button>
      </div>
      <a class="proto-link" href="/spec/08-verification/prototypes/index.html">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>交互原型库</span>
      </a>
    </div>
  </header>

  <div class="ide-shell">
    <!-- Left IDE File Explorer -->
    <aside class="ide-sidebar" id="ideSidebar">
      <div class="resizer" id="sidebarResizer" title="拖拽调整目录宽度"></div>
      <div class="explorer-top">
        <div class="explorer-title-row">
          <span class="explorer-label">${bundle.rootName} / explorer</span>
          <div class="explorer-actions">
            <button class="icon-btn" id="btnLocateActive" title="在目录树中定位当前阅读文件">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            </button>
            <button class="icon-btn" id="btnExpandAll" title="展开全部目录">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="7 15 12 20 17 15"/><polyline points="7 9 12 4 17 9"/></svg>
            </button>
            <button class="icon-btn" id="btnCollapseAll" title="折叠全部目录">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="7 20 12 15 17 20"/><polyline points="7 4 12 9 17 4"/></svg>
            </button>
          </div>
        </div>
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" id="searchInput" class="search-input" placeholder="过滤文件名、ID 或全文…" />
          <span class="search-kbd">⌘K</span>
        </div>
        <div class="search-stat" id="searchStat"></div>
      </div>
      <nav class="tree-viewport" id="treeNav" aria-label="File Explorer"></nav>
    </aside>

    <!-- Center Markdown Canvas -->
    <main class="doc-canvas" id="mainStream"></main>

    <!-- Right Dynamic Outline -->
    <aside class="ide-toc" id="ideToc">
      <div class="toc-hd">On This Page</div>
      <div class="toc-doc-title" id="tocDocTitle"></div>
      <ul class="toc-list" id="tocList"></ul>
    </aside>
  </div>

  <!-- Floating Jump-Back Pill -->
  <div class="return-pill" id="backPill">
    <span id="backPillText">已跳转至引用定义处</span>
    <button class="ret-btn" id="backJumpBtn">← 返回刚看处</button>
    <button class="ret-close" id="backCloseBtn" title="关闭">✕</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    const BUNDLE = ${safeBundleJson};
    const INITIAL_DOC = ${safeInitialDoc};
    const URL_BASE = BUNDLE.urlBase; // '/spec' | '/meta' | ''
    const ROOT_PREFIX = URL_BASE ? URL_BASE + '/' : '/';

    const SVG_CHEV = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    const SVG_FOLDER = '<svg class="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
    const SVG_FILE = '<svg class="t-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';

    const DOC_MAP = new Map();
    const DIR_SET = new Set();
    BUNDLE.docs.forEach((d) => DOC_MAP.set(d.relPath, d));
    (function collectDirs(nodes) {
      for (const n of nodes) {
        if (n.kind === 'dir') { DIR_SET.add(n.relPath); collectDirs(n.children); }
      }
    })(BUNDLE.tree);

    function domIdForDoc(relPath) { return 'doc--' + relPath.replace(/[^a-zA-Z0-9_-]/g, '__'); }
    function domIdForDir(relPath) { return 'dir--' + relPath.replace(/[^a-zA-Z0-9_-]/g, '__'); }

    function normalizePosix(p) {
      const parts = p.split('/');
      const st = [];
      for (const seg of parts) {
        if (!seg || seg === '.') continue;
        if (seg === '..') { if (st.length) st.pop(); }
        else st.push(seg);
      }
      return '/' + st.join('/');
    }

    function resolveHrefFromDoc(sourceDocRelPath, rawHref) {
      if (!rawHref) return null;
      const trimmed = rawHref.trim();
      if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(trimmed)) {
        return { external: true, url: trimmed };
      }
      if (trimmed.startsWith('#')) {
        return { inBook: true, docRelPath: sourceDocRelPath, anchor: decodeURIComponent(trimmed.slice(1)) };
      }
      const hashIdx = trimmed.indexOf('#');
      const pathPart = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
      const anchorPart = hashIdx >= 0 ? decodeURIComponent(trimmed.slice(hashIdx + 1)) : '';

      const subDir = sourceDocRelPath.includes('/') ? sourceDocRelPath.slice(0, sourceDocRelPath.lastIndexOf('/')) : '';
      const baseDir = (URL_BASE || '') + '/' + subDir;
      const resolvedPath = pathPart.startsWith('/')
        ? normalizePosix(pathPart)
        : normalizePosix(baseDir + '/' + pathPart);

      // 优先命中当前工作区已加载的文档集合
      if (URL_BASE && (resolvedPath === URL_BASE || resolvedPath.startsWith(ROOT_PREFIX))) {
        const candidate = resolvedPath === URL_BASE ? '' : resolvedPath.slice(ROOT_PREFIX.length);
        if (DOC_MAP.has(candidate)) return { inBook: true, docRelPath: candidate, anchor: anchorPart };
        if (DOC_MAP.has(candidate + '/README.md')) return { inBook: true, docRelPath: candidate + '/README.md', anchor: anchorPart };
        if (DOC_MAP.has(candidate + '/_index.md')) return { inBook: true, docRelPath: candidate + '/_index.md', anchor: anchorPart };
        if (DIR_SET.has(candidate)) return { inBookDir: true, dirRelPath: candidate };
      }

      // 跨工作区 .md 跳转（如从 spec 跳往 meta，或从仓库根 README 跳往 spec / meta）
      if (resolvedPath.startsWith('/spec/') && resolvedPath.endsWith('.md')) {
        const rel = resolvedPath.slice('/spec/'.length);
        return { external: false, url: '/spec#' + encodeURIComponent(rel) + (anchorPart ? '::' + encodeURIComponent(anchorPart) : '') };
      }
      if (resolvedPath.startsWith('/meta/') && resolvedPath.endsWith('.md')) {
        const rel = resolvedPath.slice('/meta/'.length);
        return { external: false, url: '/meta#' + encodeURIComponent(rel) + (anchorPart ? '::' + encodeURIComponent(anchorPart) : '') };
      }

      return { external: false, url: resolvedPath + (anchorPart ? '#' + encodeURIComponent(anchorPart) : '') };
    }

    // 离线兜底 Markdown 解析器
    function fallbackParse(md) {
      function inline(s) {
        return s
          .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
          .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
      }
      const lines = md.replace(/\\r\\n/g, '\\n').split('\\n');
      let html = '', inCode = false, codeFence = '', codeLang = '', codeBuf = [], inTable = false, tRows = [];
      function flushTable() {
        if (!inTable) return;
        inTable = false;
        if (tRows.length < 2) return;
        const parseRow = r => r.replace(/^\\||\\|$/g, '').replace(/\\\\\\|/g, '&#124;').split('|').map(c => inline(c.trim()));
        const head = parseRow(tRows[0]);
        const body = tRows.slice(2).map(parseRow);
        html += '<div class="table-wrap"><table><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
          body.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
        tRows = [];
      }
      for (const line of lines) {
        const fm = line.match(/^\\s*(\`{3,})(.*)$/);
        if (fm) {
          if (!inCode) { flushTable(); inCode = true; codeFence = fm[1]; codeLang = fm[2].trim(); codeBuf = []; continue; }
          else if (fm[1].length >= codeFence.length && !fm[2].trim()) {
            inCode = false;
            const body = codeBuf.join('\\n').replace(/&/g, '&amp;').replace(/</g, '&lt;');
            html += codeLang === 'mermaid' ? '<div class="mermaid">' + body + '</div>' : '<pre><code>' + body + '</code></pre>';
            continue;
          }
        }
        if (inCode) { codeBuf.push(line); continue; }
        if (/^\\|.*\\|\\s*$/.test(line.trim())) { inTable = true; tRows.push(line.trim()); continue; }
        flushTable();
        if (!line.trim()) continue;
        if (/^---+$/.test(line.trim())) { html += '<hr/>'; continue; }
        const hm = line.match(/^(#{1,4})\\s+(.*)$/);
        if (hm) { html += '<h' + hm[1].length + '>' + inline(hm[2]) + '</h' + hm[1].length + '>'; continue; }
        if (/^>\\s?/.test(line)) { html += '<blockquote><p>' + inline(line.replace(/^>\\s?/, '')) + '</p></blockquote>'; continue; }
        if (/^\\s*[-*]\\s+/.test(line)) { html += '<ul><li>' + inline(line.replace(/^\\s*[-*]\\s+/, '')) + '</li></ul>'; continue; }
        if (/^\\s*\\d+\\.\\s+/.test(line)) { html += '<ol><li>' + inline(line.replace(/^\\s*\\d+\\.\\s+/, '')) + '</li></ol>'; continue; }
        html += '<p>' + inline(line) + '</p>';
      }
      flushTable();
      return html;
    }

    // 1. 构建左侧 IDE 文件资源管理器树
    const treeNav = document.getElementById('treeNav');
    function buildIdeTree(nodes) {
      return nodes.map((n) => {
        if (n.kind === 'dir') {
          return \`
            <div class="t-node t-dir" data-tree-dir="\${n.relPath}">
              <div class="t-row" data-dir-target="\${n.relPath}" title="\${BUNDLE.rootName}/\${n.relPath}/">
                <span class="t-chev">\${SVG_CHEV}</span>
                \${SVG_FOLDER}
                <span class="t-name">\${n.name}</span>
                <span class="t-badge">\${n.mdCount}</span>
              </div>
              <div class="t-children">\${buildIdeTree(n.children)}</div>
            </div>\`;
        }
        const desc = n.shortDesc && n.shortDesc !== n.name ? n.shortDesc : '';
        return \`
          <div class="t-node t-file-wrap" data-file-wrap="\${n.relPath}">
            <a class="t-row t-file" href="#\${encodeURIComponent(n.relPath)}" data-tree-doc="\${n.relPath}" title="\${n.relPath} — \${n.title}">
              <span class="t-chev" style="visibility:hidden">\${SVG_CHEV}</span>
              \${SVG_FILE}
              <span class="t-name">\${n.name}</span>
              \${desc ? \`<span class="t-desc">\${desc}</span>\` : ''}
            </a>
          </div>\`;
      }).join('');
    }
    treeNav.innerHTML = buildIdeTree(BUNDLE.tree);

    // 2. 构建右侧主画布（保持目录层级分组）
    let markedRenderer = null;
    if (window.marked) {
      markedRenderer = new marked.Renderer();
      const origCode = markedRenderer.code.bind(markedRenderer);
      markedRenderer.code = function(code, infostring) {
        const text = typeof code === 'object' ? code.text : code;
        const lang = (typeof code === 'object' ? code.lang : infostring) || '';
        if (lang === 'mermaid') {
          const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          return '<div class="mermaid">' + esc + '</div>';
        }
        return origCode(code, infostring);
      };
    }

    function renderMd(mdText) {
      if (window.marked && markedRenderer) {
        const rawHtml = marked.parse(mdText, { renderer: markedRenderer, headerIds: false, mangle: false });
        return rawHtml.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\\/table>/g, '</table></div>');
      }
      return fallbackParse(mdText);
    }

    function buildCanvas(nodes) {
      return nodes.map((n) => {
        if (n.kind === 'dir') {
          return \`
            <section class="folder-group" id="\${domIdForDir(n.relPath)}" data-canvas-dir="\${n.relPath}">
              <div class="folder-header" data-fold-dir="\${n.relPath}">
                <span class="folder-pill">\${SVG_FOLDER} \${BUNDLE.rootName}/\${n.relPath}</span>
                <span class="folder-fold-hint">\${n.mdCount} files · 点击折叠</span>
              </div>
              <div class="folder-children">\${buildCanvas(n.children)}</div>
            </section>\`;
        }
        const docObj = DOC_MAP.get(n.relPath);
        return \`
          <article class="doc-section" id="\${domIdForDoc(n.relPath)}" data-doc="\${n.relPath}">
            <div class="doc-meta-bar">
              <span class="doc-filepath">\${SVG_FILE} \${BUNDLE.rootName}/\${n.relPath}</span>
              <div class="doc-meta-actions">
                <button class="meta-act-btn" data-copy-link="\${n.relPath}">复制定位链接</button>
              </div>
            </div>
            <div class="md-prose">\${renderMd(docObj.content)}</div>
          </article>\`;
      }).join('');
    }

    const mainStream = document.getElementById('mainStream');
    mainStream.innerHTML = buildCanvas(BUNDLE.tree);

    // 3. 为每个文档内的 H2/H3 赋予作用域内锚点，并重写全部相对链接
    document.querySelectorAll('.doc-section').forEach((sec) => {
      const sourceDoc = sec.getAttribute('data-doc');
      sec.querySelectorAll('h2, h3').forEach((h, idx) => {
        if (!h.id && !h.querySelector('a[id]')) {
          h.id = domIdForDoc(sourceDoc) + '--h-' + idx;
        }
      });

      sec.querySelectorAll('a[href]').forEach((a) => {
        const rawHref = a.getAttribute('href');
        const resolved = resolveHrefFromDoc(sourceDoc, rawHref);
        if (!resolved) return;
        if (resolved.inBook) {
          const hashTarget = encodeURIComponent(resolved.docRelPath) +
            (resolved.anchor ? '::' + encodeURIComponent(resolved.anchor) : '');
          a.setAttribute('href', '#' + hashTarget);
          a.setAttribute('data-jump-doc', resolved.docRelPath);
          if (resolved.anchor) a.setAttribute('data-jump-anchor', resolved.anchor);
          a.classList.add('in-book-link');
          a.title = BUNDLE.rootName + '/' + resolved.docRelPath + (resolved.anchor ? ' #' + resolved.anchor : '');
        } else if (resolved.inBookDir) {
          a.setAttribute('href', '#dir:' + encodeURIComponent(resolved.dirRelPath));
          a.setAttribute('data-jump-dir', resolved.dirRelPath);
          a.classList.add('in-book-link');
        } else {
          a.setAttribute('href', resolved.url);
          if (resolved.external) { a.target = '_blank'; a.rel = 'noopener'; }
        }
      });
    });

    // 4. 更新顶栏面包屑、左侧目录树高亮与右侧本篇大纲 (On This Page)
    let viewMode = 'all';
    let activeDocPath = BUNDLE.docs[0] ? BUNDLE.docs[0].relPath : '';
    let lastJumpOrigin = null;

    function updateRightToc(docRelPath) {
      const docObj = DOC_MAP.get(docRelPath);
      const sec = document.querySelector(\`.doc-section[data-doc="\${CSS.escape(docRelPath)}"]\`);
      const tocTitle = document.getElementById('tocDocTitle');
      const tocList = document.getElementById('tocList');
      if (!docObj || !sec) return;
      tocTitle.textContent = docObj.name;
      const headings = Array.from(sec.querySelectorAll('h2, h3'));
      if (!headings.length) {
        tocList.innerHTML = '<li class="toc-item"><a href="#" style="color:#9ca3af;pointer-events:none;">暂无小节标题</a></li>';
        return;
      }
      tocList.innerHTML = headings.map((h) => {
        const anchorEl = h.querySelector('a[id]');
        const targetId = anchorEl ? anchorEl.id : h.id;
        const lv = h.tagName === 'H3' ? 'lv-3' : 'lv-2';
        const cleanText = h.textContent.trim();
        return \`<li class="toc-item \${lv}"><a href="#\${encodeURIComponent(docRelPath)}::\${encodeURIComponent(targetId)}" data-toc-doc="\${docRelPath}" data-toc-id="\${targetId}" title="\${cleanText}">\${cleanText}</a></li>\`;
      }).join('');
    }

    function renderBreadcrumb(docRelPath) {
      const crumb = document.getElementById('headerCrumb');
      const parts = [BUNDLE.rootName, ...docRelPath.split('/')];
      crumb.innerHTML = parts.map((p, idx) => (
        idx === parts.length - 1
          ? \`<span class="crumb-file">\${p}</span>\`
          : \`<span>\${p}</span><span class="crumb-sep">/</span>\`
      )).join('');
    }

    function setActiveDoc(docRelPath, scrollTree = true) {
      if (!docRelPath || !DOC_MAP.has(docRelPath)) return;
      activeDocPath = docRelPath;
      renderBreadcrumb(docRelPath);
      updateRightToc(docRelPath);

      document.querySelectorAll('.t-file.active').forEach((el) => el.classList.remove('active'));
      const item = document.querySelector(\`.t-file[data-tree-doc="\${CSS.escape(docRelPath)}"]\`);
      if (item) {
        item.classList.add('active');
        let p = item.parentElement;
        while (p && p !== treeNav) {
          if (p.classList.contains('t-dir')) p.classList.remove('collapsed');
          p = p.parentElement;
        }
        if (scrollTree) item.scrollIntoView({ block: 'nearest' });
      }
    }

    function applyViewMode(mode) {
      viewMode = mode;
      document.getElementById('modeAllBtn').classList.toggle('active', mode === 'all');
      document.getElementById('modeSingleBtn').classList.toggle('active', mode === 'single');
      document.querySelectorAll('.folder-header').forEach((h) => {
        h.style.display = mode === 'single' ? 'none' : '';
      });
      document.querySelectorAll('.doc-section').forEach((sec) => {
        if (mode === 'all') sec.classList.remove('single-hidden');
        else sec.classList.toggle('single-hidden', sec.getAttribute('data-doc') !== activeDocPath);
      });
      if (mode === 'single') window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function unfoldParentFolders(el) {
      let cur = el;
      while (cur && cur !== mainStream) {
        if (cur.classList && cur.classList.contains('folder-group')) cur.classList.remove('folded');
        cur = cur.parentElement;
      }
    }

    function navigateToDocAnchor(docRelPath, anchorId, options = {}) {
      const sec = document.querySelector(\`.doc-section[data-doc="\${CSS.escape(docRelPath)}"]\`);
      if (!sec) return;

      if (options.recordOrigin) {
        const fromDoc = options.originDoc || activeDocPath;
        lastJumpOrigin = { scrollY: window.scrollY, docRelPath: fromDoc };
        document.getElementById('backPillText').textContent = '来自 ' + fromDoc.split('/').pop();
        document.getElementById('backPill').classList.add('visible');
      }

      setActiveDoc(docRelPath, true);
      if (viewMode === 'single') applyViewMode('single');
      unfoldParentFolders(sec);

      let targetEl = sec;
      if (anchorId) {
        targetEl = sec.querySelector(\`[id="\${CSS.escape(anchorId)}"]\`) || document.getElementById(anchorId) || sec;
      }

      targetEl.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
      if (targetEl !== sec) {
        const host = targetEl.closest('tr, h1, h2, h3, h4, li, p') || targetEl;
        host.classList.remove('jump-flash');
        void host.offsetWidth;
        host.classList.add('jump-flash');
      }

      if (options.pushHash !== false) {
        const newHash = '#' + encodeURIComponent(docRelPath) + (anchorId ? '::' + encodeURIComponent(anchorId) : '');
        if (location.hash !== newHash) history.pushState(null, '', newHash);
      }
      document.getElementById('ideSidebar').classList.remove('mobile-open');
    }

    // 5. 事件绑定：画布引用点击、左侧 IDE 树、右侧 TOC、侧栏拖拽调宽
    mainStream.addEventListener('click', (e) => {
      const foldHd = e.target.closest('[data-fold-dir]');
      if (foldHd) {
        foldHd.parentElement.classList.toggle('folded');
        return;
      }
      const copyBtn = e.target.closest('[data-copy-link]');
      if (copyBtn) {
        const rel = copyBtn.getAttribute('data-copy-link');
        const url = location.origin + (URL_BASE || '/README.md') + '#' + encodeURIComponent(rel);
        navigator.clipboard?.writeText(url);
        const old = copyBtn.textContent;
        copyBtn.textContent = '已复制 ✓';
        setTimeout(() => { copyBtn.textContent = old; }, 1300);
        return;
      }
      const link = e.target.closest('a.in-book-link');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();

      const jumpDir = link.getAttribute('data-jump-dir');
      if (jumpDir) {
        const dirEl = document.getElementById(domIdForDir(jumpDir));
        if (dirEl) { unfoldParentFolders(dirEl); dirEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        return;
      }
      const originDoc = link.closest('.doc-section')?.getAttribute('data-doc') || activeDocPath;
      navigateToDocAnchor(link.getAttribute('data-jump-doc'), link.getAttribute('data-jump-anchor') || '', {
        recordOrigin: true,
        originDoc,
        pushHash: true
      });
    });

    treeNav.addEventListener('click', (e) => {
      const dirRow = e.target.closest('[data-dir-target]');
      if (dirRow) {
        const dirNode = dirRow.parentElement;
        const clickedChev = e.target.closest('.t-chev');
        dirNode.classList.toggle('collapsed');
        if (!clickedChev && !dirNode.classList.contains('collapsed') && viewMode === 'all') {
          const dirSec = document.getElementById(domIdForDir(dirRow.getAttribute('data-dir-target')));
          if (dirSec) { unfoldParentFolders(dirSec); dirSec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }
        return;
      }
      const fileRow = e.target.closest('.t-file');
      if (fileRow) {
        e.preventDefault();
        navigateToDocAnchor(fileRow.getAttribute('data-tree-doc'), '', { recordOrigin: false, pushHash: true });
      }
    });

    document.getElementById('tocList').addEventListener('click', (e) => {
      const a = e.target.closest('a[data-toc-doc]');
      if (!a) return;
      e.preventDefault();
      navigateToDocAnchor(a.getAttribute('data-toc-doc'), a.getAttribute('data-toc-id'), { recordOrigin: false, pushHash: true });
    });

    document.getElementById('backJumpBtn').addEventListener('click', () => {
      if (!lastJumpOrigin) return;
      if (viewMode === 'single') {
        setActiveDoc(lastJumpOrigin.docRelPath, true);
        applyViewMode('single');
      }
      window.scrollTo({ top: lastJumpOrigin.scrollY, behavior: 'smooth' });
      document.getElementById('backPill').classList.remove('visible');
    });
    document.getElementById('backCloseBtn').addEventListener('click', () => {
      document.getElementById('backPill').classList.remove('visible');
    });

    document.getElementById('modeAllBtn').addEventListener('click', () => applyViewMode('all'));
    document.getElementById('modeSingleBtn').addEventListener('click', () => applyViewMode('single'));
    document.getElementById('btnToggleSidebar').addEventListener('click', () => {
      if (window.innerWidth <= 860) document.getElementById('ideSidebar').classList.toggle('mobile-open');
      else document.body.classList.toggle('sidebar-collapsed');
    });
    document.getElementById('btnLocateActive').addEventListener('click', () => setActiveDoc(activeDocPath, true));
    document.getElementById('btnExpandAll').addEventListener('click', () => {
      document.querySelectorAll('.t-dir.collapsed').forEach((d) => d.classList.remove('collapsed'));
      document.querySelectorAll('.folder-group.folded').forEach((d) => d.classList.remove('folded'));
    });
    document.getElementById('btnCollapseAll').addEventListener('click', () => {
      document.querySelectorAll('.t-dir').forEach((d) => d.classList.add('collapsed'));
    });

    // 侧边栏宽度拖拽调节（仿 VS Code Splitter）
    const resizer = document.getElementById('sidebarResizer');
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      resizer.classList.add('dragging');
      const onMove = (ev) => {
        const w = Math.min(480, Math.max(210, ev.clientX));
        document.documentElement.style.setProperty('--sidebar-w', w + 'px');
      };
      const onUp = () => {
        resizer.classList.remove('dragging');
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    // 快捷键 ⌘K 聚焦搜索 / ⌘B 切换目录栏
    const searchInput = document.getElementById('searchInput');
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.body.classList.remove('sidebar-collapsed');
        searchInput.focus();
        searchInput.select();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        document.body.classList.toggle('sidebar-collapsed');
      }
    });

    // 实时过滤文件树与画布
    const searchStat = document.getElementById('searchStat');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let hits = 0;
      BUNDLE.docs.forEach((d) => {
        const ok = !q || d.relPath.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
        if (ok) hits += 1;
        const wrap = document.querySelector(\`[data-file-wrap="\${CSS.escape(d.relPath)}"]\`);
        if (wrap) wrap.classList.toggle('t-hidden', !ok);
        if (viewMode === 'all') {
          const sec = document.querySelector(\`.doc-section[data-doc="\${CSS.escape(d.relPath)}"]\`);
          if (sec) sec.style.display = ok ? '' : 'none';
        }
      });
      document.querySelectorAll('.t-dir').forEach((dirEl) => {
        const hasVisible = dirEl.querySelector('.t-file-wrap:not(.t-hidden)');
        dirEl.classList.toggle('t-hidden', !hasVisible);
        if (q && hasVisible) dirEl.classList.remove('collapsed');
      });
      document.querySelectorAll('.folder-group').forEach((g) => {
        if (!q) { g.style.display = ''; return; }
        const anyVisible = Array.from(g.querySelectorAll('.doc-section')).some((s) => s.style.display !== 'none');
        g.style.display = anyVisible ? '' : 'none';
        if (anyVisible) g.classList.remove('folded');
      });
      if (q) {
        searchStat.textContent = \`匹配 \${hits} / \${BUNDLE.totalDocs} 个文件\`;
        searchStat.classList.add('shown');
      } else {
        searchStat.classList.remove('shown');
      }
    });

    // Scroll-Spy 跟随高亮当前文件
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (viewMode !== 'all' || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        let cur = activeDocPath;
        for (const sec of document.querySelectorAll('.doc-section')) {
          if (sec.style.display === 'none') continue;
          if (sec.getBoundingClientRect().top <= 120) cur = sec.getAttribute('data-doc');
          else break;
        }
        if (cur && cur !== activeDocPath) setActiveDoc(cur, true);
        ticking = false;
      });
    }, { passive: true });

    // 初始化定位（支持直接访问 /spec/xxx.md#anchor 或 /spec#xxx.md::anchor）
    function syncInitialOrHash(instant = false) {
      const raw = location.hash ? location.hash.slice(1) : '';
      if (raw.startsWith('dir:')) {
        const dirEl = document.getElementById(domIdForDir(decodeURIComponent(raw.slice(4))));
        if (dirEl) dirEl.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      if (raw.includes('::')) {
        const [d, a] = raw.split('::');
        const docRel = decodeURIComponent(d);
        if (DOC_MAP.has(docRel)) {
          navigateToDocAnchor(docRel, decodeURIComponent(a), { instant, pushHash: false });
          return;
        }
      }
      if (raw) {
        const dec = decodeURIComponent(raw);
        if (DOC_MAP.has(dec)) {
          navigateToDocAnchor(dec, '', { instant, pushHash: false });
          return;
        }
        if (INITIAL_DOC && DOC_MAP.has(INITIAL_DOC)) {
          navigateToDocAnchor(INITIAL_DOC, dec, { instant, pushHash: false });
          return;
        }
        const anyEl = document.getElementById(dec);
        if (anyEl) {
          const hostSec = anyEl.closest('.doc-section');
          if (hostSec) {
            navigateToDocAnchor(hostSec.getAttribute('data-doc'), dec, { instant, pushHash: false });
            return;
          }
        }
      }
      if (INITIAL_DOC && DOC_MAP.has(INITIAL_DOC)) {
        navigateToDocAnchor(INITIAL_DOC, '', { instant, pushHash: false });
        return;
      }
      if (BUNDLE.docs[0]) setActiveDoc(BUNDLE.docs[0].relPath, false);
    }

    if (INITIAL_DOC && URL_BASE && location.pathname !== URL_BASE) {
      const initHash = location.hash ? location.hash.slice(1) : '';
      const normUrl = URL_BASE + '#' + encodeURIComponent(INITIAL_DOC) + (initHash ? '::' + initHash : '');
      history.replaceState(null, '', normUrl);
    }
    window.addEventListener('popstate', () => syncInitialOrHash(false));
    syncInitialOrHash(true);

    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif'
      });
      mermaid.run({ querySelector: '.mermaid' }).then(() => {
        if (location.hash || INITIAL_DOC) syncInitialOrHash(true);
      }).catch(() => {});
    }
  </script>
</body>
</html>`;
}

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

    // 1. 访问根路径或 /spec、/meta 目录，直接打开全库 IDE 工作台
    if (urlPath === '/' || urlPath === '/spec' || urlPath === '/spec/' || urlPath === '/spec-all') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderWorkspacePage('spec', ''));
      return;
    }
    if (urlPath === '/meta' || urlPath === '/meta/' || urlPath === '/meta-all') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderWorkspacePage('meta', ''));
      return;
    }

    const safeTarget = path.resolve(ROOT, '.' + urlPath);
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
      const migrated = path.resolve(ROOT, 'spec', '.' + urlPath);
      if (migrated.startsWith(ROOT) && fs.existsSync(migrated) && fs.statSync(migrated).isFile()) {
        res.writeHead(302, { Location: '/spec' + urlPath });
        res.end();
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }

    const ext = path.extname(finalPath).toLowerCase();
    // 2. 任何 .md URL（如 /meta/README.md 或 /spec/06-pages/.../*.md）全部统一渲染进带左侧目录树的 IDE 工作台并自动定位！
    if (ext === '.md') {
      const relFromRoot = path.relative(ROOT, finalPath).split(path.sep).join('/');
      if (relFromRoot.startsWith('spec/')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderWorkspacePage('spec', relFromRoot.slice('spec/'.length)));
        return;
      }
      if (relFromRoot.startsWith('meta/')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderWorkspacePage('meta', relFromRoot.slice('meta/'.length)));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderWorkspacePage('', relFromRoot));
      return;
    }

    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(finalPath).pipe(res);
  });
}

if (process.argv[2] === '--export-spec') {
  const outFile = path.resolve(process.cwd(), process.argv[3] || 'spec-panorama.html');
  fs.writeFileSync(outFile, renderWorkspacePage('spec', ''), 'utf8');
  console.log('✅ 已导出 spec 全库单页 HTML 快照 -> ' + outFile);
  process.exit(0);
}

const DEFAULT_PORT = parseInt(process.argv[2], 10) || 8090;

function start(port) {
  const server = createServer();
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') start(port + 1);
    else throw err;
  });
  server.listen(port, '127.0.0.1', () => {
    const specUrl = `http://127.0.0.1:${port}/spec`;
    const metaUrl = `http://127.0.0.1:${port}/meta`;
    const protoUrl = `http://127.0.0.1:${port}/spec/08-verification/prototypes/index.html`;
    console.log('\n==============================================================');
    console.log('✨ Product IDE 级全库工作台预览服务已就绪！');
    console.log(`👉 spec 业务规格全库工作台 : ${specUrl}`);
    console.log(`👉 meta 元规范全库工作台   : ${metaUrl}`);
    console.log(`👉 可交互微原型总控台      : ${protoUrl}`);
    console.log('==============================================================\n');

    if (!process.env.NO_OPEN) {
      const cmd = process.platform === 'darwin'
        ? `open "${specUrl}"`
        : process.platform === 'win32'
          ? `start "" "${specUrl}"`
          : `xdg-open "${specUrl}"`;
      exec(cmd, () => {});
    }
  });
}

start(DEFAULT_PORT);
