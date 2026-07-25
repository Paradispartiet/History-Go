#!/usr/bin/env node
import {spawnSync} from 'node:child_process';const r=spawnSync(process.execPath,['tools/validate-historie-domain.mjs','his_minne_kulturarv_historiebruk'],{stdio:'inherit'});process.exit(r.status??1);
