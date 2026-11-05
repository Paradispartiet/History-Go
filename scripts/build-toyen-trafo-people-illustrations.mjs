import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const spec = [
  ['thorvald_astrup', 'by'],
  ['kari_rolfsen', 'kunst'],
];
const read = p => JSON.parse(fs.readFileSync(path.join(root,p), 'utf8'));
const write = (p,o) => fs.writeFileSync(path.join(root,p), JSON.stringify(o,null,2)+'\n');
const summary = [];

for (const [id, category] of spec) {
  const source = `bilder/kort/people/source/toyen_trafo_${id}_illustration.svg`;
  const output = `bilder/kort/people/toyen_trafo_${id}_illustration.webp`;
  const bytes = fs.readFileSync(path.join(root, source));
  if (!bytes.toString('utf8').includes('AI-ILLUSTRASJON')) throw new Error('Visible disclosure missing: ' + source);
  await sharp(bytes, {density: 96}).resize(1024,1536).webp({quality:86,effort:6}).toFile(path.join(root,output));
  const binary = fs.readFileSync(path.join(root,output));
  const dimensions = await sharp(binary).metadata();
  if (dimensions.width!==1024 || dimensions.height!==1536 || dimensions.format!=='webp') throw new Error('Invalid WebP '+output);
  const hash = crypto.createHash('sha256').update(binary).digest('hex');
  const pfile = `data/people/${category}/oslo/toyen_trafo/${id}.json`;
  const rows = read(pfile);
  const p = rows.find(p => p.id === id);
  if (!p) throw new Error('Missing canonical profile '+id);
  p.image = output;
  p.cardImage = output;
  p.imageStatus = 'original_ai_illustration_published';
  p.imageMeta = {
    imageKind:'ai_generated_illustration',nonDocumentary:true,facialLikenessVerified:false,
    noSourcePhotographClaim:true,visibleLabel:'AI-ILLUSTRASJON',
    credit:'History Go / original AI-assisted vector illustration',sourceAsset:source,
    sourceType:'original_non_documentary_artwork',createdAt:'2026-11-05',
    rights:'Original project illustration. No reference press photograph was reused.',
    mediaType:'image/webp',width:dimensions.width,height:dimensions.height,
    sha256:hash,bytes:binary.length
  };
  write(pfile, rows);
  summary.push({id,image:output,source,sha256:hash,bytes:binary.length,
    width:dimensions.width,height:dimensions.height,imageKind:'ai_generated_illustration',
    visibleLabel:'AI-ILLUSTRASJON',facialLikenessVerified:false});
}
write('reports/place-production/toyen-trafo-people-illustrations-20261105.json',{
  placeId:'toyen_trafo',date:'2026-11-05',kind:'original_non_documentary_ai_illustrations',
  likeness:'Not a portrait likeness claim; the depicted faces are interpretive and unverified.',
  sourceImages:'Original hand-built vector compositions; no unlicensed portrait photo downloaded.',
  note:'Each output embeds the label AI-ILLUSTRASJON visibly in the image. Original SVG is retained.',
  media:summary
});
console.log('Wrote '+summary.length+' original 1024x1536 People WebPs for Tøyen trafo');
