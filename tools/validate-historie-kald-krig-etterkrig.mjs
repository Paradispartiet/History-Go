#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['tools/validate-historie-domain.mjs', 'his_kald_krig_etterkrig'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
