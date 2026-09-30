#!/usr/bin/env node
// Structural validator for the game-* skills. Zero dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILL_NAMES = [
    'game-workflow',
    'game-concept-example',
    'game-prototype-example',
    'game-skeleton-first',
    'game-implementation-boundary',
    'game-workflow-html-review',
];

const ENGINE_FILES = ['engine.md', 'boundary.md', 'typescript.md', 'project-rules.md'];
// Headings other skills reference by name (game-workflow, game-implementation-boundary SKILL.md).
const REQUIRED_HEADINGS = {
    'boundary.md': '## High-Risk Topics (recommend COMPLEX)',
    'project-rules.md': '# Verification Checklist',
};
const LEGACY_NAME = /\bcocos-(workflow-html-review|workflow|concept-example|prototype-example|skeleton-first|implementation-boundary)\b/;
const CODEX_RESIDUE = /\.codex|python\s/i;
const DRAFT_MARKER = /\bDRAFT\b|\[CONFIRM\]|【需確認】/;
const HAN_TEXT = /\p{Script=Han}/u;

function listFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...listFiles(full));
        } else {
            out.push(full);
        }
    }
    return out;
}

function frontmatterName(text) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!match) {
        return null;
    }
    const nameLine = /^name:\s*(.+?)\s*$/m.exec(match[1]);
    return nameLine ? nameLine[1] : null;
}

function checkEngines(skillsRoot, failures) {
    const boundaryDir = path.join(skillsRoot, 'game-implementation-boundary');
    if (!fs.existsSync(boundaryDir)) {
        return;
    }
    const registry = path.join(boundaryDir, 'engines', 'README.md');
    if (!fs.existsSync(registry)) {
        failures.push(`${registry}: engines registry missing`);
        return;
    }
    const folderPattern = /`engines\/([^/`]+)\/`/g;
    const tableRows = fs.readFileSync(registry, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith('|'))
        .join('\n');
    for (const match of tableRows.matchAll(folderPattern)) {
        for (const file of ENGINE_FILES) {
            const full = path.join(boundaryDir, 'engines', match[1], file);
            if (!fs.existsSync(full)) {
                failures.push(`${full}: engine file missing ${file}`);
                continue;
            }
            const heading = REQUIRED_HEADINGS[file];
            if (heading && !fs.readFileSync(full, 'utf8').split(/\r?\n/).includes(heading)) {
                failures.push(`${full}: heading missing "${heading}"`);
            }
        }
    }
}

export function validate(skillsRoot) {
    const failures = [];
    for (const name of SKILL_NAMES) {
        const skillFile = path.join(skillsRoot, name, 'SKILL.md');
        if (!fs.existsSync(skillFile)) {
            failures.push(`${path.join(skillsRoot, name)}: missing skill ${name}`);
            continue;
        }
        const declared = frontmatterName(fs.readFileSync(skillFile, 'utf8'));
        if (declared !== name) {
            failures.push(`${skillFile}: name mismatch (frontmatter "${declared}")`);
        }
        for (const file of listFiles(path.join(skillsRoot, name))) {
            const base = path.basename(file);
            if (base.endsWith('.py') || base === 'openai.yaml') {
                failures.push(`${file}: codex file`);
                continue;
            }
            const text = fs.readFileSync(file, 'utf8');
            if (LEGACY_NAME.test(text)) {
                failures.push(`${file}: legacy name`);
            }
            if (CODEX_RESIDUE.test(text)) {
                failures.push(`${file}: codex residue`);
            }
            if (DRAFT_MARKER.test(text)) {
                failures.push(`${file}: draft marker`);
            }
            // Rules and skills are written in English; only game-workflow/SKILL.md carries Chinese trigger keywords.
            const isTriggerFile = name === 'game-workflow' && base === 'SKILL.md';
            if (base.endsWith('.md') && !isTriggerFile && HAN_TEXT.test(text)) {
                failures.push(`${file}: chinese text`);
            }
        }
    }
    checkEngines(skillsRoot, failures);
    return failures;
}

// Every `~/.claude/skills/...` path cited in the global CLAUDE.md must exist in the skills root.
export function validateGlobal(claudeMdPath, skillsRoot) {
    const failures = [];
    const text = fs.readFileSync(claudeMdPath, 'utf8');
    for (const match of text.matchAll(/`~\/\.claude\/skills\/([^`]+)`/g)) {
        if (!fs.existsSync(path.join(skillsRoot, match[1]))) {
            failures.push(`${claudeMdPath}: missing reference ${match[1]}`);
        }
    }
    return failures;
}

const isMain =process.argv[1] && fs.realpathSync.native(path.resolve(process.argv[1])) === fs.realpathSync.native(fileURLToPath(import.meta.url));
if (isMain) {
    const defaultRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'skills');
    const root = path.resolve(process.argv[2] || defaultRoot);
    const failures = validate(root);
    // Repo layout: skills/ next to global/CLAUDE.md; installed layout: ~/.claude/skills next to ~/.claude/CLAUDE.md.
    const claudeMd = [path.join(root, '..', 'global', 'CLAUDE.md'), path.join(root, '..', 'CLAUDE.md')].find((p) => fs.existsSync(p));
    if (claudeMd) {
        failures.push(...validateGlobal(claudeMd, root));
    }
    if (failures.length === 0) {
        console.log('OK');
    } else {
        for (const line of failures) {
            console.log(`FAIL ${line}`);
        }
        process.exitCode = 1;
    }
}
