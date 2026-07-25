#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_global_kolonial_transnasjonal'],{stdio:'inherit'});process.exit(r.status??1);
