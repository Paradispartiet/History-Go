#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resolverPath = path.join(ROOT, 'js/Civication/systems/civicationCareerRoleResolver.js');
const anchor = "  ROLE_SCOPE_BY_ROLE_ID.barnehageassistent = 'barnehageassistent';";
const alias = "  ROLE_SCOPE_BY_ROLE_ID.sport_profesjonell_utover = 'sport_utover';";

let source = fs.readFileSync(resolverPath, 'utf8');
if (!source.includes(alias)) {
  if (!source.includes(anchor)) {
    throw new Error('Sport-utøver resolver alias anchor is missing; refusing a blind patch');
  }
  source = source.replace(anchor, `${anchor}\n${alias}`);
  fs.writeFileSync(resolverPath, source);
}

const verified = fs.readFileSync(resolverPath, 'utf8');
if (!verified.includes(alias)) {
  throw new Error('Sport-utøver resolver alias was not materialized');
}
console.log('Sport-utøver resolver alias: PASS');
