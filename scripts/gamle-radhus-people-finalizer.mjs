#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const self = path.join(root, 'scripts/gamle-radhus-people-finalizer.mjs');
const manifestPath = 'data/people/manifest.json';
const wanted = [
  'people/historie/oslo/gamle_radhus/lauritz_hansen.json',
  'people/by/oslo/gamle_radhus/lars_backer.json',
  'people/by/oslo/gamle_radhus/carl_berner_arkitekt.json',
  'people/musikk/oslo/gamle_radhus/gjoril_songvoll.json'
];

execFileSync('git', ['fetch', 'origin', 'main:refs/remotes/origin/main'], { cwd: root, stdio: 'inherit' });
const mainManifest = JSON.parse(execFileSync('git', ['show', `origin/main:${manifestPath}`], { cwd: root, encoding: 'utf8' }));
if (!Array.isArray(mainManifest.files)) throw new Error('Current main people manifest has no files[]');
for (const rel of wanted) if (!mainManifest.files.includes(rel)) mainManifest.files.push(rel);
fs.writeFileSync(path.join(root, manifestPath), `${JSON.stringify(mainManifest, null, 2)}\n`, 'utf8');
fs.rmSync(self);
console.log('Rebased Gamle rådhus people manifest additions onto current main.');
