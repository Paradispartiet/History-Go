#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['tools/validate-historie-domain.mjs', 'his_kjonn_familie_livslop'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
