#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_okonomi_handel_materielle_systemer'],{stdio:'inherit'});process.exit(r.status??1);
