#!/usr/bin/env node
import { auditKjemiStrict } from './audit-kjemi-strict-v1.mjs';const r=auditKjemiStrict({writeReport:true});console.log('Kjemi strict materialized deterministically: '+r.counts.domains+'/12.');
