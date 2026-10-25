import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { JSDOM } from 'jsdom';
const source=fs.readFileSync('js/ui/place-card.js','utf8');
function setup(){
 const dom=new JSDOM('<div class="pc-heading-content"></div>');
 const start=source.indexOf('function renderPlaceCardPhotoCaption(');
 assert.ok(start>=0,'photo caption renderer exists');
 const end=source.indexOf('\n}',start)+2;
 const context={};vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 return {dom,render:context.renderPlaceCardPhotoCaption,host:dom.window.document.querySelector('div')};
}
test('historical photo date is visible and cleared when switching to current photos',()=>{
 const {dom,render,host}=setup();
 const meta={historicalOnly:true,historicalCaption:'Y-blokka i 2008, før rivingen i 2020.'};
 render(host,meta);assert.equal(host.querySelector('.pc-photo-caption').textContent,meta.historicalCaption);
 render(host,meta);assert.equal(host.querySelectorAll('.pc-photo-caption').length,1);
 render(host,{});assert.equal(host.querySelector('.pc-photo-caption'),null);dom.window.close();
});
test('photo caption is rendered as text rather than executable markup',()=>{
 const {dom,render,host}=setup();
 render(host,{historicalOnly:true,historicalCaption:'2008 <img src=x onerror=alert(1)>'});
 assert.equal(host.querySelector('img'),null);assert.match(host.textContent,/2008 <img/);dom.window.close();
});
