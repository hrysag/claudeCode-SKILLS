#!/usr/bin/env node
// Render workflow Markdown to review HTML. Zero dependencies (Node 18+).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export function slugify(text) {
    const cleaned = text.replace(/[^\p{L}\p{N}_\s-]/gu, '').trim().toLowerCase();
    return cleaned.replace(/[-\s]+/g, '-') || 'section';
}

function renderInline(text) {
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return escaped;
}

function splitTableRow(line) {
    let stripped = line.trim();
    if (stripped.startsWith('|')) {
        stripped = stripped.slice(1);
    }
    if (stripped.endsWith('|')) {
        stripped = stripped.slice(0, -1);
    }
    return stripped.split('|').map((cell) => cell.trim());
}

function parseTableAlignment(separator, expectedColumns) {
    const cells = splitTableRow(separator);
    if (cells.length !== expectedColumns) {
        return null;
    }
    const alignments = [];
    for (const cell of cells) {
        if (!/^:?-{3,}:?$/.test(cell)) {
            return null;
        }
        const left = cell.startsWith(':');
        const right = cell.endsWith(':');
        if (left && right) {
            alignments.push('center');
        } else if (right) {
            alignments.push('right');
        } else if (left) {
            alignments.push('left');
        } else {
            alignments.push('');
        }
    }
    return alignments;
}

function isTableStart(lines, index) {
    if (index + 1 >= lines.length) {
        return false;
    }
    const header = splitTableRow(lines[index]);
    if (header.length < 2 || !lines[index].includes('|')) {
        return false;
    }
    return parseTableAlignment(lines[index + 1], header.length) !== null;
}

function renderTable(lines, startIndex) {
    const headers = splitTableRow(lines[startIndex]);
    const alignments = parseTableAlignment(lines[startIndex + 1], headers.length) || headers.map(() => '');
    const rows = [];
    let index = startIndex + 2;

    while (index < lines.length) {
        const line = lines[index];
        if (!line.trim() || !line.includes('|')) {
            break;
        }
        const cells = splitTableRow(line);
        if (cells.length !== headers.length) {
            break;
        }
        rows.push(cells);
        index += 1;
    }

    const styleFor = (columnIndex) => {
        const alignment = alignments[columnIndex];
        return alignment ? ` style="text-align: ${alignment};"` : '';
    };
    const headCells = headers.map((cell, i) => `<th${styleFor(i)}>${renderInline(cell)}</th>`).join('');
    const bodyRows = rows.map((row) => {
        const rowCells = row.map((cell, i) => `<td${styleFor(i)}>${renderInline(cell)}</td>`).join('');
        return `<tr>${rowCells}</tr>`;
    });

    const tableHtml = '<div class="table-wrap"><table>'
        + `<thead><tr>${headCells}</tr></thead>`
        + `<tbody>${bodyRows.join('')}</tbody>`
        + '</table></div>';
    return [tableHtml, index];
}

function splitLines(text) {
    // Same line boundaries as str.splitlines() in the original renderer.
    const lines = text.split(/\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/);
    if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
    }
    return lines;
}

export function renderMarkdown(markdown) {
    const lines = splitLines(markdown);
    const body = [];
    const toc = [];
    let inCode = false;
    let codeLines = [];
    let inUl = false;
    let inOl = false;
    let index = 0;

    const closeLists = () => {
        if (inUl) {
            body.push('</ul>');
            inUl = false;
        }
        if (inOl) {
            body.push('</ol>');
            inOl = false;
        }
    };
    const flushCode = () => {
        body.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
        codeLines = [];
    };

    while (index < lines.length) {
        const line = lines[index];

        if (line.startsWith('```')) {
            if (inCode) {
                flushCode();
                inCode = false;
            } else {
                closeLists();
                inCode = true;
                codeLines = [];
            }
            index += 1;
            continue;
        }

        if (inCode) {
            codeLines.push(line);
            index += 1;
            continue;
        }

        if (isTableStart(lines, index)) {
            closeLists();
            const [tableHtml, nextIndex] = renderTable(lines, index);
            body.push(tableHtml);
            index = nextIndex;
            continue;
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
            closeLists();
            const level = heading[1].length;
            const text = heading[2].trim();
            const anchor = slugify(text);
            toc.push([level, text, anchor]);
            body.push(`<h${level} id="${anchor}">${renderInline(text)}</h${level}>`);
            index += 1;
            continue;
        }

        if (/^\s*[-*]\s+/.test(line)) {
            if (inOl) {
                body.push('</ol>');
                inOl = false;
            }
            if (!inUl) {
                body.push('<ul>');
                inUl = true;
            }
            body.push(`<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
            index += 1;
            continue;
        }

        if (/^\s*\d+\.\s+/.test(line)) {
            if (inUl) {
                body.push('</ul>');
                inUl = false;
            }
            if (!inOl) {
                body.push('<ol>');
                inOl = true;
            }
            body.push(`<li>${renderInline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
            index += 1;
            continue;
        }

        closeLists();

        if (line.trim() === '') {
            body.push('');
        } else if (line.trim().startsWith('>')) {
            body.push(`<blockquote>${renderInline(line.trim().slice(1).trim())}</blockquote>`);
        } else {
            body.push(`<p>${renderInline(line)}</p>`);
        }
        index += 1;
    }

    if (inCode) {
        flushCode();
    }
    closeLists();
    return { toc, body: body.join('\n') };
}

function timestamp(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
        + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function buildHtml(source, title, markdown) {
    const { toc, body } = renderMarkdown(markdown);
    const generated = timestamp(new Date());
    const tocItems = toc
        .map(([level, text, anchor]) => `<li class="level-${level}"><a href="#${anchor}">${escapeHtml(text)}</a></li>`)
        .join('\n');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f7f7f4;
      --panel: #ffffff;
      --text: #202124;
      --muted: #666b72;
      --line: #d7d9de;
      --accent: #0f766e;
      --code-bg: #f0f2f4;
      --table-stripe: #f8fafb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #181a1b;
        --panel: #202326;
        --text: #eceff1;
        --muted: #a3aab2;
        --line: #3b4148;
        --accent: #5eead4;
        --code-bg: #141719;
        --table-stripe: #1b1f23;
      }
    }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "Segoe UI", Arial, sans-serif;
      line-height: 1.58;
    }
    header {
      border-bottom: 1px solid var(--line);
      background: var(--panel);
      padding: 20px 28px;
    }
    header h1 {
      margin: 0 0 8px;
      font-size: 26px;
      letter-spacing: 0;
    }
    header p {
      margin: 2px 0;
      color: var(--muted);
      font-size: 13px;
      word-break: break-all;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
      gap: 24px;
      max-width: 1380px;
      margin: 0 auto;
      padding: 24px;
    }
    nav {
      position: sticky;
      top: 16px;
      align-self: start;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      max-height: calc(100vh - 48px);
      overflow: auto;
    }
    nav h2 {
      margin: 0 0 10px;
      font-size: 14px;
      color: var(--muted);
      text-transform: uppercase;
    }
    nav ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    nav li {
      margin: 6px 0;
      font-size: 14px;
    }
    nav li.level-2 { padding-left: 10px; }
    nav li.level-3, nav li.level-4, nav li.level-5, nav li.level-6 { padding-left: 20px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    main {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 28px;
      min-width: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.4em;
      margin-bottom: 0.55em;
      line-height: 1.25;
      letter-spacing: 0;
    }
    h1:first-child, h2:first-child { margin-top: 0; }
    code {
      background: var(--code-bg);
      border-radius: 4px;
      padding: 2px 5px;
      font-family: Consolas, "Courier New", monospace;
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: auto;
      padding: 14px;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid var(--accent);
      margin-left: 0;
      padding: 8px 14px;
      color: var(--muted);
      background: var(--code-bg);
    }
    .table-wrap {
      overflow-x: auto;
      margin: 18px 0;
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 520px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px 12px;
      vertical-align: top;
    }
    th {
      background: var(--code-bg);
      font-weight: 600;
      text-align: left;
    }
    tbody tr:nth-child(even) {
      background: var(--table-stripe);
    }
    tbody tr:last-child td {
      border-bottom: 0;
    }
    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
        padding: 16px;
      }
      nav {
        position: static;
        max-height: none;
      }
      main {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p>Source: ${escapeHtml(source)}</p>
    <p>Generated: ${escapeHtml(generated)}</p>
  </header>
  <div class="layout">
    <nav>
      <h2>Sections</h2>
      <ul>
        ${tocItems}
      </ul>
    </nav>
    <main>
      ${body}
    </main>
  </div>
</body>
</html>
`;
}

export function titleFromFilename(file) {
    const stem = path.basename(file, path.extname(file)).replace(/[-_]/g, ' ');
    // str.title() semantics of the original renderer: a cased char is uppercased after an uncased char, lowercased otherwise.
    let previousCased = false;
    let title = '';
    for (const ch of stem) {
        const cased = ch.toUpperCase() !== ch.toLowerCase();
        title += cased ? (previousCased ? ch.toLowerCase() : ch.toUpperCase()) : ch;
        previousCased = cased;
    }
    return title;
}

function main() {
    const { values } = parseArgs({
        options: {
            input: { type: 'string' },
            output: { type: 'string' },
            title: { type: 'string' },
        },
    });
    if (!values.input || !values.output) {
        console.error('usage: render_markdown_review.mjs --input <md> --output <html> [--title <title>]');
        process.exit(2);
    }
    const source = path.normalize(values.input);
    const output = path.normalize(values.output);
    const markdown = fs.readFileSync(source, 'utf8');
    const title = values.title || titleFromFilename(source);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, buildHtml(source, title, markdown), 'utf8');
    console.log(`Wrote ${output}`);
}

const isMain = process.argv[1] && fs.realpathSync.native(path.resolve(process.argv[1])) === fs.realpathSync.native(fileURLToPath(import.meta.url));
if (isMain) {
    main();
}
