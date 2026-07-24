# History phase 2 quiz diagnostic

test:quiz-content-audit exit: 0
test:quiz-production exit: 1

## test:quiz-content-audit
```text

> history-go@0.0.0 test:quiz-content-audit
> node --test tests/quiz-content-quality-audit.test.mjs

TAP version 13
# Subtest: flags emne-first wording and a quiz outside the canonical balance
ok 1 - flags emne-first wording and a quiz outside the canonical balance
  ---
  duration_ms: 10.946958
  ...
# Subtest: accepts a 60/20/20 content mix
ok 2 - accepts a 60/20/20 content mix
  ---
  duration_ms: 2.645105
  ...
# Subtest: flags a correct answer that is much longer than the distractors
ok 3 - flags a correct answer that is much longer than the distractors
  ---
  duration_ms: 1.894507
  ...
# Subtest: keeps repaired Deichman and Ullevaal quizzes within the canonical balance
ok 4 - keeps repaired Deichman and Ullevaal quizzes within the canonical balance
  ---
  duration_ms: 6.872236
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 68.344941
```

## test:quiz-production
```text

> history-go@0.0.0 test:quiz-production
> node --test tests/quiz-production-pipeline.test.mjs

TAP version 13
# Subtest: builds the full by production context through the manifest
ok 1 - builds the full by production context through the manifest
  ---
  duration_ms: 160.538016
  ...
# Subtest: builds the full history production context through domain-based curriculum
not ok 2 - builds the full history production context through domain-based curriculum
  ---
  duration_ms: 104.260346
  location: '/home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:47:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    53 !== 49
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 49
  actual: 53
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:61:10)
    async Test.run (node:internal/test_runner/test:797:9)
    async Test.processPendingSubtests (node:internal/test_runner/test:526:7)
  ...
# Subtest: isolates each history target in the manifest proof
not ok 3 - isolates each history target in the manifest proof
  ---
  duration_ms: 103.385641
  location: '/home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:87:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    53 !== 49
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 49
  actual: 53
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:101:10)
    async Test.run (node:internal/test_runner/test:797:9)
    async Test.processPendingSubtests (node:internal/test_runner/test:526:7)
  ...
# Subtest: builds the Grindheimsvegen grave-field context before quiz writing
not ok 4 - builds the Grindheimsvegen grave-field context before quiz writing
  ---
  duration_ms: 105.465076
  location: '/home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:127:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    53 !== 49
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 49
  actual: 53
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:141:10)
    async Test.run (node:internal/test_runner/test:797:9)
    async Test.processPendingSubtests (node:internal/test_runner/test:526:7)
  ...
# Subtest: builds the Høyland grave-mound context before quiz writing
not ok 5 - builds the Høyland grave-mound context before quiz writing
  ---
  duration_ms: 96.126845
  location: '/home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:173:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    53 !== 49
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 49
  actual: 53
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/History-Go/History-Go/tests/quiz-production-pipeline.test.mjs:187:10)
    async Test.run (node:internal/test_runner/test:797:9)
    async Test.processPendingSubtests (node:internal/test_runner/test:526:7)
  ...
# Subtest: passes production-context, progression and theory-binding audits
ok 6 - passes production-context, progression and theory-binding audits
  ---
  duration_ms: 846.663656
  ...
1..6
# tests 6
# suites 0
# pass 2
# fail 4
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1473.812378
```
