import fs from 'fs';
import path from 'path';

const root = process.cwd();
const dir = path.join(root, 'data/i18n/content/places');

function files(d: string): string[] {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []
  );
}

function dup(text: string): string[] {
  const d: string[] = [];
  let i = 0;
  const st: string[] = [];
  const maps: Set<string>[] = [];
  const ws = (): void => {
    while (/\s/.test(text[i])) i++;
  };
  const str = (): string => {
    let r = '';
    i++;
    while (i < text.length) {
      const c = text[i++];
      if (c === '\\') {
        r += c + (text[i++] || '');
        continue;
      }
      if (c === '"') break;
      r += c;
    }
    return r;
  };
  while (i < text.length) {
    ws();
    const c = text[i];
    if (c === '"') {
      const s = str();
      ws();
      if (text[i] === ':' && st.at(-1) === '{') {
        const m = maps.at(-1);
        if (m.has(s)) d.push(s);
        else m.add(s);
      }
    } else if (c === '{') {
      st.push('{');
      maps.push(new Set<string>());
      i++;
    } else if (c === '[') {
      st.push('[');
      i++;
    } else if (c === '}' || c === ']') {
      const p = st.pop();
      if (c === '}' && p === '{') maps.pop();
      i++;
    } else i++;
  }
  return d;
}

let bad = 0;
for (const f of files(dir)) {
  const t = fs.readFileSync(f, 'utf8');
  const d = dup(t);
  if (d.length) {
    bad++;
    console.error(`${path.relative(root, f)} duplicate keys: ${[...new Set(d)].join(', ')}`);
  }
}
if (bad) {
  process.exit(1);
}
console.log('OK: no duplicate JSON keys in i18n place files.');
