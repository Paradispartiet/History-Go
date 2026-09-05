import fs from 'node:fs';

const file = 'scripts/TEMP_materialize_historie_forvaltning_radgivning_role_world.mjs';
const before = fs.readFileSync(file, 'utf8');
const needle = '`direct` jobbtilbud, senior standing og History Go';
const matches = before.split(needle).length - 1;
if (matches !== 1) {
  throw new Error(`Expected exactly one advisory direct-literal syntax target, found ${matches}`);
}
const after = before.replace(needle, 'direct jobbtilbud, senior standing og History Go');
fs.writeFileSync(file, after);
console.log('Removed the single nested backtick pair around direct in advisory Role World summary template');
