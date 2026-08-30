#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const write=(file,value)=>fs.writeFileSync(path.join(root,file),`${JSON.stringify(value,null,2)}\n`);
const placeFile="data/places/religion/oslo/akershus_slottskirke/akershus_slottskirke.json";
const packetFile="data/places/production/akershus_slottskirke.json";
const storyFile="data/stories/stories_akershus_slottskirke.json";
const storyId="st_akershus_slottskirke_olav_v_1991";
const place=read(placeFile);
const packet=read(packetFile);

// Canonical People owner: use three directly connected people whose existing
// canonical identity media are already complete. Christian IV remodelled the
// church; Olav V is tied to the 1991 royal funeral rite; Arnstein Arneberg led
// the 1953–1957 restoration.
place.related_people_ids=["christian_iv","olav_v","arnstein_arneberg"];
write(placeFile,place);

const relations=read("data/relations.json");
const filtered=relations.filter(rel=>rel.id!=="rel_akershus_slottskirke_haakon_vii"&&rel.id!=="rel_akershus_slottskirke_christian_iv");
filtered.push({
  id:"rel_akershus_slottskirke_christian_iv",
  type:"person_place",
  personId:"christian_iv",
  placeId:"akershus_slottskirke",
  relation:"ominnredet_kirken_som_del_av_slottets_ombygging",
  year:1624,
  source:"https://www.forsvarshistoriskmuseum.no/akershus-slott/akershus-slottskirke"
});
write("data/relations.json",filtered);

// v4.2 strong-claim contract. These two sentences are intentionally retained
// because their exact historical claims are independently corroborated.
const independent="https://oslobyleksikon.no/side/Akershus_slottskirke";
for(const sentenceNumber of [6,23]){
  const coverage=packet.sentenceCoverage?.popupDesc?.find(item=>item.sentence===sentenceNumber);
  if(!coverage?.claimIds?.length)throw new Error(`Missing popupDesc sentence coverage ${sentenceNumber}`);
  for(const claimId of coverage.claimIds){
    const claim=packet.claims.find(item=>item.id===claimId);
    if(!claim)throw new Error(`Missing claim ${claimId}`);
    claim.claimKind="strong";
    claim.evidenceMode="explicit";
    claim.independentSourceUrls=[independent];
  }
}
write(packetFile,packet);

// Stories integrity contract. The generator serializes this Story file as a
// top-level array. Keep a defensive object fallback so the repair fails closed
// if the serialization contract changes again.
const storyDoc=read(storyFile);
const stories=Array.isArray(storyDoc)?storyDoc:storyDoc.stories;
if(!Array.isArray(stories))throw new Error(`Unexpected Story document shape in ${storyFile}`);
const story=stories.find(item=>item.id===storyId);
if(!story)throw new Error(`Missing generated Story ${storyId}`);
if(!Array.isArray(story.sources)||story.sources.length!==2)throw new Error(`Unexpected Story source count for ${storyId}`);
story.type="historical_event";
story.score={
  narrative:3,
  historical:2,
  source:4,
  play_value:3,
  originality:3,
  total:15
};
write(storyFile,storyDoc);

console.log(JSON.stringify({
  people:place.related_people_ids,
  strongPopupSentences:[6,23],
  independentSource:independent,
  story:{id:storyId,type:story.type,score:story.score}
},null,2));
