#!/usr/bin/env node
import { auditFysikkStrict } from './audit-fysikk-strict-v1.mjs';const r=auditFysikkStrict({writeReport:true});console.log('Fysikk strict materialized deterministically: '+r.counts.domains+'/12.');
