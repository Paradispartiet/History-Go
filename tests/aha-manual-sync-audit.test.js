const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Adapter = require('../js/ahaManualSyncAdapter.js');
const Repository = require('../js/ahaManualSyncAuditRepository.js');
const Dashboard = require('../js/ahaDashboard.js');

const baseRun = {
  runId: 'run-123',
  timestamp: '2026-06-06T10:00:00.000Z',
  target: 'aha_imports',
  targetStatus: 'ready',
  includedModules: ['lists', 'paths'],
  excludedModules: ['avisa'],
  itemCounts: { lists: 2, paths: 3 },
  readinessStatus: 'ready',
  validationSummary: { ok: true, checked: 5 },
  checklistSummary: { ok: true, completed: 4, total: 4 },
  confirmation: { confirmed: true, confirmedAt: '2026-06-06T09:59:59.000Z' },
  payload: {
    lists: [{ id: 'one' }, { id: 'two' }],
    paths: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    accessToken: 'must-not-enter-audit',
    nested: { password: 'must-not-enter-audit-either' }
  }
};

function successfulAuditResult(entry) {
  return {
    ok: true,
    status: 'success',
    auditId: `audit-${entry.runId}`,
    runId: entry.runId,
    target: entry.target,
    writtenAt: '2026-06-06T10:00:01.000Z',
    errors: [],
    warnings: []
  };
}

(async () => {
  // Loading modules and creating UI view models are side-effect free.
  let auditCalls = 0;
  assert.strictEqual(auditCalls, 0, 'no audit is written on page/module load');
  Dashboard.createAhaManualSyncAuditViewModel({ auditStatus: 'not_configured' });
  assert.strictEqual(auditCalls, 0, 'opening Sync Hub/result presentation writes no audit');
  ({ ...baseRun, target: 'another_target' });
  assert.strictEqual(auditCalls, 0, 'target selection writes no audit');
  ({ ...baseRun, confirmation: { confirmed: false } });
  assert.strictEqual(auditCalls, 0, 'opening confirmation modal writes no audit');

  let capturedAudit = null;
  const success = await Adapter.executeAhaManualSyncRun(baseRun, {
    writeTarget: async () => ({ ok: true, status: 'success' }),
    auditWriter: async (entry) => {
      auditCalls += 1;
      capturedAudit = entry;
      return successfulAuditResult(entry);
    }
  });

  assert.strictEqual(auditCalls, 1, 'audit writer is called exactly once for successful manual sync');
  assert.strictEqual(success.status, 'success');
  assert.strictEqual(success.auditStatus, 'success');
  assert.strictEqual(success.auditId, 'audit-run-123');
  assert.strictEqual(capturedAudit.runId, 'run-123');
  assert.strictEqual(capturedAudit.target, 'aha_imports');
  assert.deepStrictEqual(capturedAudit.includedModules, ['lists', 'paths']);
  assert.deepStrictEqual(capturedAudit.excludedModules, ['avisa']);
  assert.deepStrictEqual(capturedAudit.itemCounts, { lists: 2, paths: 3 });
  assert.strictEqual(capturedAudit.totalItems, 5);
  assert.strictEqual(capturedAudit.resultStatus, 'success');
  assert.strictEqual(capturedAudit.writeStatus, 'success');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(capturedAudit, 'payload'), false, 'full payload is not stored in audit entry');
  assert(capturedAudit.payloadSummary.checksum, 'payload checksum is included');
  assert.strictEqual(JSON.stringify(capturedAudit).includes('must-not-enter-audit'), false, 'secrets are absent from audit entry');

  const failedAudit = await Adapter.executeAhaManualSyncRun(baseRun, {
    writeTarget: async () => ({ ok: true, status: 'success' }),
    auditWriter: async () => ({ ok: false, status: 'failed', errors: ['audit unavailable'], warnings: [] })
  });
  assert.strictEqual(failedAudit.status, 'partial_success', 'successful target write is not reported as full success when audit fails');
  assert.strictEqual(failedAudit.ok, false);
  assert.strictEqual(failedAudit.auditStatus, 'failed');
  assert(failedAudit.errors.includes('audit unavailable'));

  let blockedEntry = null;
  const blocked = await Adapter.executeAhaManualSyncRun({ ...baseRun, confirmation: { confirmed: false } }, {
    writeTarget: async () => { throw new Error('target writer must not run'); },
    auditWriter: async (entry) => {
      blockedEntry = entry;
      return successfulAuditResult(entry);
    }
  });
  assert.strictEqual(blocked.status, 'blocked');
  assert.strictEqual(blocked.auditStatus, 'success');
  assert.strictEqual(blockedEntry.resultStatus, 'blocked');
  assert.strictEqual(blockedEntry.writeStatus, 'not_started');

  const missingRequiredWriter = await Adapter.executeAhaManualSyncRun(baseRun, {
    writeTarget: async () => ({ ok: true }),
    auditRepository: {},
    requireAuditWriter: true
  });
  assert.strictEqual(missingRequiredWriter.status, 'blocked');
  assert.strictEqual(missingRequiredWriter.reason, 'Audit log writer is not configured.');
  assert.strictEqual(missingRequiredWriter.auditStatus, 'not_configured');

  const targetFailure = await Adapter.executeAhaManualSyncRun(baseRun, {
    writeTarget: async () => ({ ok: false, status: 'failed', error: new Error('target failed'), rollbackStatus: 'partial' }),
    auditWriter: async (entry) => successfulAuditResult(entry)
  });
  assert.strictEqual(targetFailure.status, 'failed');
  assert.strictEqual(targetFailure.auditStatus, 'success');
  assert.strictEqual(targetFailure.rollbackStatus, 'partial');
  assert(targetFailure.errors.includes('target failed'));

  const rawAudit = {
    ...capturedAudit,
    payload: { forbidden: true },
    password: 'nope',
    nested: { apiKey: 'nope', safe: 'yes' },
    errors: ['safe error']
  };
  const sanitized = Repository.sanitizeAhaManualSyncAuditEntry(rawAudit);
  const sanitizedJson = JSON.stringify(sanitized);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(sanitized, 'payload'), false);
  assert.strictEqual(sanitizedJson.includes('nope'), false);
  assert.strictEqual(sanitizedJson.includes('forbidden'), false);

  let storedRecord = null;
  const fakeClient = {
    from(table) {
      assert.strictEqual(table, 'aha_imports', 'audit uses the existing database target');
      return {
        upsert(record) {
          storedRecord = record;
          return {
            select() {
              return { single: async () => ({ data: { id: record.id, created_at: record.created_at }, error: null }) };
            }
          };
        }
      };
    }
  };
  const repositoryResult = await Repository.writeAhaManualSyncAuditLog(rawAudit, {
    auth: {
      getClient: async () => fakeClient,
      getSession: async () => ({ user: { id: 'profile-1' } })
    }
  });
  assert.strictEqual(repositoryResult.ok, true);
  assert.strictEqual(repositoryResult.status, 'success');
  assert.strictEqual(storedRecord.source_app, 'historygo_manual_sync_audit');
  assert.strictEqual(storedRecord.profile_id, 'profile-1');
  assert.strictEqual(JSON.stringify(storedRecord).includes('nope'), false, 'repository never persists secrets');
  assert.strictEqual(JSON.stringify(storedRecord.payload).includes('forbidden'), false, 'repository never persists full payload');

  const dashboardSource = fs.readFileSync(path.join(__dirname, '../js/ahaDashboard.js'), 'utf8');
  assert.strictEqual(/getClient|\.from\(|writeAhaManualSyncAuditLog|syncHistoryGoPayload/.test(dashboardSource), false, 'dashboard does not write directly to audit/database');
  assert.deepStrictEqual(Dashboard.createAhaManualSyncAuditViewModel(success), {
    auditStatus: 'success',
    auditId: 'audit-run-123',
    message: 'Audit log written',
    error: ''
  });
  assert.strictEqual(Dashboard.createAhaManualSyncAuditViewModel(missingRequiredWriter).message, 'Audit log not configured');

  const homeSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  ['ahaLists.js', 'ahaPaths.js', 'ahaGroups.js', 'ahaAvisa.js'].forEach((file) => {
    assert.strictEqual(homeSource.includes(file), false, `Home does not load ${file}`);
  });

  console.log('AHA manual sync audit tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
