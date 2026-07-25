#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-v5.mjs','--write'],{stdio:'inherit'});process.exit(r.status??1);
