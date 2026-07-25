#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_offentlighet_mobilisering_bevegelser'],{stdio:'inherit'});process.exit(r.status??1);
