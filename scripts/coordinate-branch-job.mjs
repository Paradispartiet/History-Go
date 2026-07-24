import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');
const inputs = ['osm-google-photo-1-full.jpg', 'osm-google-photo-2-full.jpg'];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  return { command: `$ ${command} ${args.join(' ')}`, stdout: result.stdout ?? '', stderr: result.stderr ?? '', status: result.status };
}

const logs = [];
if (spawnSync('bash', ['-lc', 'command -v convert'], { encoding: 'utf8' }).status !== 0) {
  logs.push(run('sudo', ['apt-get', 'update', '-qq']));
  logs.push(run('sudo', ['apt-get', 'install', '-y', '-qq', 'imagemagick']));
  assert(logs.every((row) => row.status === 0), 'ImageMagick setup failed.');
}

const outputs = [];
for (let index = 0; index < inputs.length; index += 1) {
  const outputName = `visual-tiny-preview-${index + 1}.jpg`;
  const input = join(reportDir, inputs[index]);
  const output = join(reportDir, outputName);
  const conversion = run('convert', [input, '-auto-orient', '-resize', '96x128>', '-strip', '-quality', '42', output]);
  logs.push(conversion);
  assert(conversion.status === 0, `Tiny preview conversion failed for ${inputs[index]}.`);
  const identify = run('identify', ['-format', '%w %h', output]);
  logs.push(identify);
  assert(identify.status === 0, `Tiny preview identify failed for ${outputName}.`);
  const [width, height] = identify.stdout.trim().split(/\s+/).map(Number);
  const bytes = (await readFile(output)).length;
  outputs.push({ file: `reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/${outputName}`, width, height, bytes });
}

await writeFile(join(reportDir, 'visual-tiny-preview-generation.log'), `${logs.map((row) => `${row.command}\n${row.stdout}\n${row.stderr}\nexit=${row.status}`).join('\n\n')}\n`, 'utf8');
await writeFile(join(reportDir, 'visual-tiny-previews.json'), `${JSON.stringify({ version: '2026-07-24', placeId: 'sigrid_undset_statue', exactOsmNodeId: 7596280553, outputs }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ placeId: 'sigrid_undset_statue', exactOsmNodeId: 7596280553, outputs }, null, 2));
