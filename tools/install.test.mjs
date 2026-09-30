import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { install } from './install.mjs';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function tmpHome() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'claude-home-'));
}

test('fresh home: creates six skills and CLAUDE.md', () => {
    const home = tmpHome();
    const result = install({ repoRoot: REPO, claudeHome: home });
    assert.deepEqual(result.conflicts, []);
    assert.ok(fs.existsSync(path.join(home, 'skills', 'game-workflow', 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(home, 'skills', 'game-implementation-boundary', 'engines', 'egret', 'boundary.md')));
    assert.equal(
        fs.readFileSync(path.join(home, 'CLAUDE.md'), 'utf8'),
        fs.readFileSync(path.join(REPO, 'global', 'CLAUDE.md'), 'utf8'));
});

test('dry run writes nothing', () => {
    const home = tmpHome();
    const result = install({ repoRoot: REPO, claudeHome: home, dryRun: true });
    assert.ok(result.actions.some((a) => a.includes('create') && a.includes('game-workflow')));
    assert.deepEqual(fs.readdirSync(home), []);
});

test('second install reports no changes', () => {
    const home = tmpHome();
    install({ repoRoot: REPO, claudeHome: home });
    const result = install({ repoRoot: REPO, claudeHome: home, dryRun: true });
    assert.ok(result.actions.every((a) => a.startsWith('unchanged')), result.actions.join('\n'));
});

test('modified installed skill is a conflict and nothing is written without force', () => {
    const home = tmpHome();
    install({ repoRoot: REPO, claudeHome: home });
    const edited = path.join(home, 'skills', 'game-workflow', 'SKILL.md');
    fs.writeFileSync(edited, 'local edit', 'utf8');
    const otherTarget = path.join(home, 'skills', 'game-skeleton-first');
    fs.rmSync(otherTarget, { recursive: true });
    const result = install({ repoRoot: REPO, claudeHome: home });
    assert.ok(result.conflicts.some((c) => c.includes('game-workflow')));
    assert.equal(fs.readFileSync(edited, 'utf8'), 'local edit');
    assert.equal(fs.existsSync(otherTarget), false, 'no partial install when conflicts exist');
});

test('force replaces a conflicting skill', () => {
    const home = tmpHome();
    install({ repoRoot: REPO, claudeHome: home });
    const edited = path.join(home, 'skills', 'game-workflow', 'SKILL.md');
    fs.writeFileSync(edited, 'local edit', 'utf8');
    install({ repoRoot: REPO, claudeHome: home, force: true });
    assert.notEqual(fs.readFileSync(edited, 'utf8'), 'local edit');
});

test('CLAUDE.md that already contains the routing block counts as unchanged', () => {
    const home = tmpHome();
    const block = fs.readFileSync(path.join(REPO, 'global', 'CLAUDE.md'), 'utf8');
    fs.writeFileSync(path.join(home, 'CLAUDE.md'), `# mine\n\nsome rule\n\n${block}`, 'utf8');
    const result = install({ repoRoot: REPO, claudeHome: home, dryRun: true });
    assert.ok(result.actions.some((a) => a.startsWith('unchanged') && a.includes('CLAUDE.md')), result.actions.join('\n'));
    assert.ok(!result.actions.some((a) => a.startsWith('manual merge')));
});

test('test files are not installed', () => {
    const home = tmpHome();
    install({ repoRoot: REPO, claudeHome: home });
    const scripts = path.join(home, 'skills', 'game-workflow-html-review', 'scripts');
    assert.deepEqual(fs.readdirSync(scripts), ['render_markdown_review.mjs']);
    const again = install({ repoRoot: REPO, claudeHome: home, dryRun: true });
    assert.ok(again.actions.every((a) => a.startsWith('unchanged')), again.actions.join('\n'));
});

test('failed copy during force keeps the old skill and leaves no temp folders', () => {
    const home = tmpHome();
    install({ repoRoot: REPO, claudeHome: home });
    const edited = path.join(home, 'skills', 'game-workflow', 'SKILL.md');
    fs.writeFileSync(edited, 'local edit', 'utf8');
    const failingCopy = () => {
        throw new Error('disk full');
    };
    assert.throws(() => install({ repoRoot: REPO, claudeHome: home, force: true, copyDir: failingCopy }), /disk full/);
    assert.equal(fs.readFileSync(edited, 'utf8'), 'local edit');
    const leftovers = fs.readdirSync(path.join(home, 'skills')).filter((n) => !n.startsWith('game-') || n.includes('.'));
    assert.deepEqual(leftovers, []);
});

test('existing different CLAUDE.md is never overwritten, even with force', () => {
    const home = tmpHome();
    fs.writeFileSync(path.join(home, 'CLAUDE.md'), '# mine\n', 'utf8');
    const result = install({ repoRoot: REPO, claudeHome: home, force: true });
    assert.equal(fs.readFileSync(path.join(home, 'CLAUDE.md'), 'utf8'), '# mine\n');
    assert.ok(result.actions.some((a) => a.startsWith('manual merge') && a.includes('CLAUDE.md')));
});
