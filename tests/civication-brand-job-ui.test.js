#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dashboardPath = path.join(repoRoot, 'js/Civication/ui/CivicationDashboardUI.js');
const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

assert(dashboardCode.includes('loadStyleOnce("css/civi-brand-job.css")'), 'Dashboard must load brand-job stylesheet once');
assert(dashboardCode.includes('loadScriptOnce("js/Civication/ui/CivicationBrandJobUI.js")'), 'Dashboard must load brand-job UI script once');
assert(dashboardCode.includes('window.CivicationBrandJobUI?.refresh?.();'), 'Dashboard must refresh brand-job UI after render');
assert(dashboardCode.includes('"civi:booted"'), 'Dashboard should refresh on civi:booted');
assert(dashboardCode.includes('"civi:dataReady"'), 'Dashboard should refresh on civi:dataReady');
assert(dashboardCode.includes('"updateProfile"'), 'Dashboard should refresh on updateProfile');
assert(dashboardCode.includes('"civi:inboxChanged"'), 'Dashboard should refresh on civi:inboxChanged');

console.log('PASS: civication brand job ui wiring test completed.');
