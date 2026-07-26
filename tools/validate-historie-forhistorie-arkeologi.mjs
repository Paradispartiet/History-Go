#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_forhistorie_arkeologi'],{stdio:'inherit'});
process.exit(r.status??1);
