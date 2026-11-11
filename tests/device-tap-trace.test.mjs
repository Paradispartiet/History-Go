import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const source=fs.readFileSync('js/debug/tap-trace.js','utf8');
function boot(enabled){
 const listeners=new Map();
 const window={addEventListener(type,fn){const rows=listeners.get(type)||[];rows.push(fn);listeners.set(type,rows);},setInterval(){}};
 const context={window,location:{search:enabled?'?hgTapTrace=1':'',hash:'#/map',origin:'https://example.test'},URLSearchParams,performance:{now:()=>123},Element:class {},document:{body:null,getElementById:()=>null,addEventListener(){}},getComputedStyle:()=>({})};
 Object.defineProperty(context,'localStorage',{get(){throw Error('Must not access storage');}});
 vm.runInNewContext(source,context,{filename:'tap-trace.js'});
 return {window,listeners};
}
test('ordinary entry leaves the opener and device state untouched',()=>{
 const {window}=boot(false);
 assert.equal(Object.getOwnPropertyDescriptor(window,'openPlaceCard'),undefined);
 assert.equal(window.HGDeviceTapTrace,undefined);
});
test('opt-in tracing preserves calls, receiver, properties, promise identity and errors',()=>{
 const {window}=boot(true);
 const response=Promise.resolve('same promise');
 const fn=function(place){assert.equal(this,window);assert.equal(place.id,'stortinget');return response;};
 fn.__patched=true;
 window.openPlaceCard=fn;
 assert.equal(window.openPlaceCard.__patched,true);
 window.openPlaceCard.extra=42;
 assert.equal(fn.extra,42);
 assert.equal(window.openPlaceCard({id:'stortinget'}),response);
 const previous=window.openPlaceCard;
 window.openPlaceCard=function(place){return previous.call(this,place);};
 assert.equal(window.openPlaceCard({id:'stortinget'}),response);
 assert.equal(window.HGDeviceTapTrace.snapshot().opens.length,2);
 const error=new Error('original');
 window.openPlaceCard=()=>{throw error;};
 assert.throws(()=>window.openPlaceCard({id:'stortinget'}),e=>e===error);
 assert.equal(window.HGDeviceTapTrace.snapshot().opens.length,3);
});
