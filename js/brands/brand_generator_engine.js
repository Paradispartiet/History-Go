(function(){

const PLACE_BLACKLIST = new Set([
"operahuset",
"kulturhuset",
"mathallen",
"deichman",
"vulkan",
"oslo s",
"torggata bad"
]);

const BRAND_HINTS = [
"records",
"law",
"studio",
"atelier",
"design",
"vintage",
"club",
"gallery",
"coffee",
"brewery",
"music"
];

function normalize(v){
return (v||"").toLowerCase().trim();
}

function scoreBrand(name){

let score = 0;
const n = normalize(name);

if(PLACE_BLACKLIST.has(n)) return -10;

if(name.length > 4) score++;

if(/[A-Z]/.test(name)) score++;

if(name.split(" ").length <= 3) score++;

for(const h of BRAND_HINTS){
if(n.includes(h)) score += 2;
}

return score;

}

function generateBrands(rawNames){

const result = [];

for(const name of rawNames){

const score = scoreBrand(name);

if(score >= 3){

result.push({
id: name.toLowerCase().replace(/\s/g,"_"),
name: name,
score: score
});

}

}

return result;

}

window.HGBrandGenerator = {
generateBrands
};

})();
