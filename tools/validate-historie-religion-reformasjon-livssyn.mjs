#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_religion_reformasjon_livssyn'],{stdio:'inherit'});process.exit(r.status??1);
