import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');
const inputs = [
  'osm-google-photo-1-full.jpg',
  'osm-google-photo-2-full.jpg',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  return { command: `$ ${command} ${args.join(' ')}`, stdout: result.stdout ?? '', stderr: result.stderr ?? '', status: result.status };
}

const setup = [];
if (spawnSync('bash', ['-lc', 'command -v convert'], { encoding: 'utf8' }).status !== 0) {
  setup.push(run('sudo', ['apt-get', 'update', '-qq']));
  setup.push(run('sudo', ['apt-get', 'install', '-y', '-qq', 'imagemagick']));
  assert(setup.every((row) => row.status === 0), 'ImageMagick setup failed.');
}

const previews = [];
const commands = [];
for (let index = 0; index < inputs.length; index += 1) {
  const input = join(reportDir, inputs[index]);
  const outputName = `visual-preview-${index + 1}.jpg`;
  const output = join(reportDir, outputName);
  const convert = run('convert', [input, '-auto-orient', '-resize', '256x256>', '-strip', '-quality', '58', output]);
  commands.push(convert);
  assert(convert.status === 0, `Preview conversion failed for ${inputs[index]}.`);
  const identify = run('identify', ['-format', '%w %h', output]);
  commands.push(identify);
  assert(identify.status === 0, `Preview identify failed for ${outputName}.`);
  const [width, height] = identify.stdout.trim().split(/\s+/).map(Number);
  const buffer = await readFile(output);
  previews.push({
    source: `reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/${inputs[index]}`,
    preview: `reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/${outputName}`,
    width,
    height,
    bytes: buffer.length,
    base64: buffer.toString('base64'),
  });
}

await writeFile(join(reportDir, 'visual-preview-generation.log'), `${[...setup, ...commands].map((row) => `${row.command}\n${row.stdout}\n${row.stderr}\nexit=${row.status}`).join('\n\n')}\n`, 'utf8');
await writeFile(join(reportDir, 'visual-previews-base64.json'), `${JSON.stringify({ version: '2026-07-24', placeId: 'sigrid_undset_statue', exactOsmNodeId: 7596280553, previews }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ placeId: 'sigrid_undset_statue', exactOsmNodeId: 7596280553, previews: previews.map(({ preview, width, height, bytes }) => ({ preview, width, height, bytes })) }, null, 2));

// Fresh push trigger for the dedicated visual-preview branch.
