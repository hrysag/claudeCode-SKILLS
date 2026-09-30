import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validate, validateGlobal, SKILL_NAMES } from './validate-skills.mjs';

const ENGINE_FILES = ['engine.md', 'boundary.md', 'typescript.md', 'project-rules.md'];

function tmpRoot() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'validate-skills-'));
}

function write(root, rel, content) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
}

function makeValidFixture() {
    const root = tmpRoot();
    for (const name of SKILL_NAMES) {
        write(root, `${name}/SKILL.md`, `---\nname: ${name}\ndescription: test\n---\n\n# Body\n`);
    }
    write(root, 'game-implementation-boundary/engines/README.md',
        '| Engine | Detect (project root) | Folder | Language / Compiler |\n| --- | --- | --- | --- |\n| Cocos | x | `engines/cocos/` | TS |\n');
    for (const file of ENGINE_FILES) {
        write(root, `game-implementation-boundary/engines/cocos/${file}`, '# ok\n');
    }
    write(root, 'game-implementation-boundary/engines/cocos/boundary.md', '# ok\n\n## High-Risk Topics (recommend COMPLEX)\n\n- x\n');
    write(root, 'game-implementation-boundary/engines/cocos/project-rules.md', '# ok\n\n# 驗證清單\n\n* x\n');
    return root;
}

function hasFailure(failures, fragment) {
    return failures.some((line) => line.includes(fragment));
}

test('empty root reports all six skills missing', () => {
    const failures = validate(tmpRoot());
    for (const name of SKILL_NAMES) {
        assert.ok(hasFailure(failures, `missing skill ${name}`), name);
    }
    assert.equal(failures.length, 6);
});

test('valid fixture passes', () => {
    assert.deepEqual(validate(makeValidFixture()), []);
});

test('frontmatter name must match folder', () => {
    const root = makeValidFixture();
    write(root, 'game-workflow/SKILL.md', '---\nname: foo\ndescription: x\n---\n');
    assert.ok(hasFailure(validate(root), 'name mismatch'));
});

test('legacy cocos-* skill names are reported', () => {
    const root = makeValidFixture();
    write(root, 'game-workflow/references/routing.md', 'use `cocos-implementation-boundary` first');
    assert.ok(hasFailure(validate(root), 'legacy name'));
});

test('codex residue in content is reported', () => {
    const root = makeValidFixture();
    write(root, 'game-workflow-html-review/notes.md', 'C:\\Users\\user\\.codex\\skills');
    assert.ok(hasFailure(validate(root), 'codex residue'));
    const root2 = makeValidFixture();
    write(root2, 'game-workflow-html-review/notes.md', 'run python render.py');
    assert.ok(hasFailure(validate(root2), 'codex residue'));
});

test('codex-only files are reported', () => {
    const root = makeValidFixture();
    write(root, 'game-workflow-html-review/scripts/render.py', 'print(1)');
    assert.ok(hasFailure(validate(root), 'codex file'));
    const root2 = makeValidFixture();
    write(root2, 'game-workflow/agents/openai.yaml', 'x: 1');
    assert.ok(hasFailure(validate(root2), 'codex file'));
});

test('draft markers are reported', () => {
    for (const marker of ['> DRAFT for review.', '**[CONFIRM]** do it', '【需確認】 決定']) {
        const root = makeValidFixture();
        write(root, 'game-implementation-boundary/engines/cocos/boundary.md', marker);
        assert.ok(hasFailure(validate(root), 'draft marker'), marker);
    }
});

test('registered engine folder must have all four files', () => {
    const root = makeValidFixture();
    fs.rmSync(path.join(root, 'game-implementation-boundary/engines/cocos/typescript.md'));
    const failures = validate(root);
    assert.ok(hasFailure(failures, 'engine file missing'));
    assert.ok(hasFailure(failures, 'typescript.md'));
});

test('only registry table rows count as engine folders', () => {
    const root = makeValidFixture();
    const registry = 'game-implementation-boundary/engines/README.md';
    const text = fs.readFileSync(path.join(root, registry), 'utf8');
    write(root, registry, `${text}\nTo add one, create \`engines/<name>/\` with four files.\n`);
    assert.deepEqual(validate(root), []);
});

test('cli prints a result when invoked through a junction', () => {
    const toolsDir = path.dirname(fileURLToPath(import.meta.url));
    const link = path.join(tmpRoot(), 'linked-tools');
    fs.symlinkSync(toolsDir, link, 'junction');
    const stdout = execFileSync(process.execPath, [path.join(link, 'validate-skills.mjs'), makeValidFixture()], { encoding: 'utf8' });
    assert.equal(stdout.trim(), 'OK');
});

test('boundary.md must keep the High-Risk Topics heading', () => {
    const root = makeValidFixture();
    write(root, 'game-implementation-boundary/engines/cocos/boundary.md', '# ok\n\n## High-Risk Topics\n');
    const failures = validate(root);
    assert.ok(hasFailure(failures, 'heading missing'));
    assert.ok(hasFailure(failures, 'High-Risk Topics (recommend COMPLEX)'));
});

test('project-rules.md must keep the 驗證清單 heading', () => {
    const root = makeValidFixture();
    write(root, 'game-implementation-boundary/engines/cocos/project-rules.md', '# ok\n');
    const failures = validate(root);
    assert.ok(hasFailure(failures, 'heading missing'));
    assert.ok(hasFailure(failures, '驗證清單'));
});

test('global CLAUDE.md skill paths must exist', () => {
    const root = makeValidFixture();
    const claudeMd = path.join(tmpRoot(), 'CLAUDE.md');
    fs.writeFileSync(claudeMd, 'read `~/.claude/skills/game-implementation-boundary/engines/cocos/typescript.md` first', 'utf8');
    assert.deepEqual(validateGlobal(claudeMd, root), []);
    fs.writeFileSync(claudeMd, 'read `~/.claude/skills/game-implementation-boundary/engines/cocos/missing.md` first', 'utf8');
    const failures = validateGlobal(claudeMd, root);
    assert.equal(failures.length, 1);
    assert.ok(hasFailure(failures, 'missing reference'));
    assert.ok(hasFailure(failures, 'missing.md'));
});

test('missing engines registry is reported', () => {
    const root = makeValidFixture();
    fs.rmSync(path.join(root, 'game-implementation-boundary/engines/README.md'));
    assert.ok(hasFailure(validate(root), 'engines registry missing'));
});
