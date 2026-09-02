#!/usr/bin/env node
import { auditBiologiStrict } from './audit-biologi-strict-v1.mjs';const r=auditBiologiStrict({writeReport:true});console.log('Biologi strict materialized deterministically: '+r.counts.domains+'/12.');
