#!/usr/bin/env node
import fs from 'node:fs';

const file = 'data/stories/stories_stortorget.json';
const stories = JSON.parse(fs.readFileSync(file, 'utf8'));
const story = stories.find((entry) => entry?.id === 'st_stortorget_hovedmarked_1737');
if (!story) throw new Error('Missing Stortorget canonical story.');
story.score = { ...story.score, historical: 2, originality: 3, total: 16 };
fs.writeFileSync(file, `${JSON.stringify(stories, null, 2)}\n`);
console.log('Stortorget story integrity score aligned.');
