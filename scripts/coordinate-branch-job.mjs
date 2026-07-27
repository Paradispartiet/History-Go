import { execSync } from 'node:child_process';
execSync('npm run audit:quiz-production-packages', { stdio: 'inherit' });
