#!/usr/bin/env node
import { auditMatematikkStrict } from './audit-matematikk-strict-v1.mjs';const r=auditMatematikkStrict({writeReport:true});console.log('Matematikk strict materialized deterministically: '+r.counts.domains+'/12.');
