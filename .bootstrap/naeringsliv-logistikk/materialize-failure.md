# Materializer failure

```text
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 161.337416
✖ failing tests:
test at tests/naeringsliv-chapter-teknologi-innovasjon-plattformer.test.mjs:6:1
✖ Teknologi, innovasjon og plattformer passes its permanent chapter gate (38.519459ms)
  AssertionError [ERR_ASSERTION]: 
  file:///home/runner/work/History-Go/History-Go/scripts/audit-naeringsliv-chapter-teknologi-innovasjon-plattformer.mjs:30
    if (!condition) throw new Error(message);
                          ^
  
  Error: Næringsliv status must state 4 of 6 chapters
      at assert (file:///home/runner/work/History-Go/History-Go/scripts/audit-naeringsliv-chapter-teknologi-innovasjon-plattformer.mjs:30:25)
      at file:///home/runner/work/History-Go/History-Go/scripts/audit-naeringsliv-chapter-teknologi-innovasjon-plattformer.mjs:170:3
      at ModuleJob.run (node:internal/modules/esm/module_job:439:25)
      at async node:internal/modules/esm/loader:643:26
      at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)
  
  Node.js v24.18.0
  
  
  1 !== 0
  
      at TestContext.<anonymous> (file:///home/runner/work/History-Go/History-Go/tests/naeringsliv-chapter-teknologi-innovasjon-plattformer.test.mjs:11:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1325:25)
      at Test.start (node:internal/test_runner/test:1191:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:385:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 1,
    expected: 0,
    operator: 'strictEqual',
    diff: 'simple'
  }
```
