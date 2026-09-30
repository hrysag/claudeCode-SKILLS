import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { slugify, renderMarkdown, buildHtml, titleFromFilename } from './render_markdown_review.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'render_markdown_review.mjs');

test('slugify keeps ascii words', () => {
    assert.equal(slugify('Phase 1: Setup'), 'phase-1-setup');
});

test('slugify keeps CJK characters (unicode word chars)', () => {
    assert.equal(slugify('設計 決策'), '設計-決策');
});

test('slugify falls back to section', () => {
    assert.equal(slugify('!!!'), 'section');
});

test('pipe table renders with alignment', () => {
    const { body } = renderMarkdown('| a | b |\n| :--- | ---: |\n| 1 | 2 |');
    assert.ok(body.includes('<th style="text-align: left;">a</th>'), body);
    assert.ok(body.includes('<td style="text-align: right;">2</td>'), body);
});

test('unclosed code fence is still rendered and escaped', () => {
    const { body } = renderMarkdown('```\nx<y');
    assert.ok(body.includes('<pre><code>x&lt;y</code></pre>'), body);
});

test('inline code and bold render', () => {
    const { body } = renderMarkdown('use `a` and **b**');
    assert.equal(body, '<p>use <code>a</code> and <strong>b</strong></p>');
});

test('lists and blockquote render', () => {
    const { body } = renderMarkdown('- a\n- b\n1. c\n> q');
    assert.equal(body, '<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n<ol>\n<li>c</li>\n</ol>\n<blockquote>q</blockquote>');
});

test('headings feed the toc', () => {
    const { toc } = renderMarkdown('# T\n## 子節');
    assert.deepEqual(toc, [[1, 'T', 't'], [2, '子節', '子節']]);
});

test('buildHtml escapes title and links toc', () => {
    const html = buildHtml('a.md', 'A & "B"', '# T');
    assert.ok(html.includes('<title>A &amp; &quot;B&quot;</title>'), 'title');
    assert.ok(html.includes('<a href="#t">T</a>'), 'toc link');
    assert.ok(html.includes('Source: a.md'), 'source');
    assert.match(html, /Generated: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
});

test('title from filename uppercases a letter after any uncased char (str.title parity)', () => {
    assert.equal(titleFromFilename('my-plan_v2.md'), 'My Plan V2');
    assert.equal(titleFromFilename('設計v2-plan.md'), '設計V2 Plan');
    assert.equal(titleFromFilename('v2x.md'), 'V2X');
});

test('unicode line separators split lines like str.splitlines', () => {
    const { toc } = renderMarkdown('# A\u2028## B\u2029### C\u0085#### D\f##### E\v###### F');
    assert.deepEqual(toc.map(([level]) => level), [1, 2, 3, 4, 5, 6]);
});

test('cli works when invoked through a junction', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-junction-'));
    const link = path.join(dir, 'linked-scripts');
    fs.symlinkSync(path.dirname(SCRIPT), link, 'junction');
    const input = path.join(dir, 'a.md');
    fs.writeFileSync(input, '# A\n', 'utf8');
    const output = path.join(dir, 'a.html');
    execFileSync(process.execPath, [path.join(link, 'render_markdown_review.mjs'), '--input', input, '--output', output], { encoding: 'utf8' });
    assert.ok(fs.existsSync(output), 'output written through junction');
});

test('cli creates missing output folder and derives title from filename', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-review-'));
    const input = path.join(dir, 'my-plan_v2.md');
    fs.writeFileSync(input, '# Hello\n', 'utf8');
    const output = path.join(dir, 'new', 'dir', 'out.html');
    const stdout = execFileSync(process.execPath, [SCRIPT, '--input', input, '--output', output], { encoding: 'utf8' });
    assert.ok(stdout.includes(`Wrote ${output}`), stdout);
    const html = fs.readFileSync(output, 'utf8');
    assert.ok(html.includes('<title>My Plan V2</title>'), 'derived title');
});
