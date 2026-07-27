import { execSync } from 'node:child_process';
execSync('npm run audit:quiz-production-context && npm run audit:quiz-progression && npm run audit:quiz-theory-binding', { stdio: 'inherit', shell: '/bin/bash' });
