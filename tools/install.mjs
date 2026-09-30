#!/usr/bin/env node
// Install the game-* skills to ~/.claude/skills and the routing rule to ~/.claude/CLAUDE.md.
// Usage: node tools/install.mjs [--dry-run] [--force]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { validate, validateGlobal, SKILL_NAMES } from './validate-skills.mjs';

// Tests stay in the source repo; they are not part of an installed skill.
function isInstallable(file) {
    return !file.endsWith('.test.mjs');
}

function listRelativeFiles(dir, base = dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...listRelativeFiles(full, base));
        } else {
            out.push(path.relative(base, full));
        }
    }
    return out.sort();
}

function sameTree(source, target) {
    const filesA = listRelativeFiles(source).filter(isInstallable);
    const filesB = listRelativeFiles(target);
    if (filesA.join('\n') !== filesB.join('\n')) {
        return false;
    }
    return filesA.every((rel) => fs.readFileSync(path.join(source, rel)).equals(fs.readFileSync(path.join(target, rel))));
}

function copyInstallable(source, target) {
    fs.cpSync(source, target, { recursive: true, filter: isInstallable });
}

// Copy into a staging folder first, then swap, so a failed copy never leaves a half-installed skill.
function replaceDir(source, target, copyDir) {
    const staging = `${target}.installing`;
    const backup = `${target}.old`;
    fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(backup, { recursive: true, force: true });
    try {
        copyDir(source, staging);
    } catch (error) {
        fs.rmSync(staging, { recursive: true, force: true });
        throw error;
    }
    const hadTarget = fs.existsSync(target);
    if (hadTarget) {
        fs.renameSync(target, backup);
    }
    fs.renameSync(staging, target);
    if (hadTarget) {
        fs.rmSync(backup, { recursive: true, force: true });
    }
}

function containsBlock(existing, block) {
    const normalize = (text) => text.replace(/\r\n/g, '\n').trim();
    return normalize(existing).includes(normalize(block));
}

export function install({ repoRoot, claudeHome, dryRun = false, force = false, copyDir = copyInstallable }) {
    const failures = [
        ...validate(path.join(repoRoot, 'skills')),
        ...validateGlobal(path.join(repoRoot, 'global', 'CLAUDE.md'), path.join(repoRoot, 'skills')),
    ];
    if (failures.length > 0) {
        throw new Error(`validation failed:\n${failures.join('\n')}`);
    }

    const actions = [];
    const conflicts = [];
    const copies = [];

    for (const name of SKILL_NAMES) {
        const source = path.join(repoRoot, 'skills', name);
        const target = path.join(claudeHome, 'skills', name);
        if (!fs.existsSync(target)) {
            actions.push(`create ${target}`);
            copies.push([source, target]);
        } else if (sameTree(source, target)) {
            actions.push(`unchanged ${target}`);
        } else if (force) {
            actions.push(`replace ${target}`);
            copies.push([source, target]);
        } else {
            conflicts.push(`${target} differs from ${source}`);
        }
    }

    const claudeSource = path.join(repoRoot, 'global', 'CLAUDE.md');
    const claudeTarget = path.join(claudeHome, 'CLAUDE.md');
    let writeClaude = false;
    if (!fs.existsSync(claudeTarget)) {
        actions.push(`create ${claudeTarget}`);
        writeClaude = true;
    } else if (containsBlock(fs.readFileSync(claudeTarget, 'utf8'), fs.readFileSync(claudeSource, 'utf8'))) {
        actions.push(`unchanged ${claudeTarget}`);
    } else {
        actions.push(`manual merge ${claudeTarget} <- ${claudeSource}`);
    }

    if (dryRun || conflicts.length > 0) {
        return { actions, conflicts, wrote: false };
    }
    fs.mkdirSync(path.join(claudeHome, 'skills'), { recursive: true });
    for (const [source, target] of copies) {
        replaceDir(source, target, copyDir);
    }
    if (writeClaude) {
        fs.mkdirSync(claudeHome, { recursive: true });
        fs.copyFileSync(claudeSource, claudeTarget);
    }
    return { actions, conflicts, wrote: true };
}

const isMain = process.argv[1] && fs.realpathSync.native(path.resolve(process.argv[1])) === fs.realpathSync.native(fileURLToPath(import.meta.url));
if (isMain) {
    const { values } = parseArgs({
        options: {
            'dry-run': { type: 'boolean', default: false },
            force: { type: 'boolean', default: false },
        },
    });
    const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
    const claudeHome = path.join(os.homedir(), '.claude');
    const result = install({ repoRoot, claudeHome, dryRun: values['dry-run'], force: values.force });
    for (const line of result.actions) {
        console.log(line);
    }
    for (const line of result.conflicts) {
        console.log(`CONFLICT ${line}`);
    }
    if (result.conflicts.length > 0) {
        console.log('Nothing written. Re-run with --force to replace the conflicting skills.');
        process.exitCode = 1;
    } else if (values['dry-run']) {
        console.log('Dry run: nothing written.');
    } else if (result.actions.some((a) => a.startsWith('manual merge'))) {
        console.log(`~/.claude/CLAUDE.md already exists and differs; merge this content manually:\n`);
        console.log(fs.readFileSync(path.join(repoRoot, 'global', 'CLAUDE.md'), 'utf8'));
    }
}
