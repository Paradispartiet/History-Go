#!/usr/bin/env node
import {auditGeologiJordvitenskapStrict} from './audit-geologi-jordvitenskap-strict-v1.mjs';const r=auditGeologiJordvitenskapStrict({writeReport:true});console.log('Geologi & jordvitenskap strict deterministic: '+r.counts.domains+'/12.');
