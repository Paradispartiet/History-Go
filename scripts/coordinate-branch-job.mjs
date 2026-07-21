import { execFileSync } from 'node:child_process';

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
const branchName = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branchName) throw new Error('Kunne ikke identifisere feature-branchen.');

run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['merge', '--no-edit', '-X', 'theirs', 'origin/main']);
run(['push', 'origin', `HEAD:${branchName}`]);

console.log('Fersk main er merget inn før auto-merge av Ljanselva batch 108.');
