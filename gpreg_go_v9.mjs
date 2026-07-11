#!/usr/bin/env node
import{createRequire}from'module';const require=createRequire(import.meta.url);
const{chromium}=require('/root/node_modules/playwright-core');
import http from'http';import https from'https';
const PX={server:'http://geo.spyderproxy.com:12321',username:'DAz7xCYHAy',password:'YOuOgB3lMb_country-gb_state-england'};
const API='https://thenewworldorder.io/gpreg-api/entries';
const NMS={given:['James','Emma','Oliver','Amelia','Thomas','Jessica','William','Olivia','Jack','Sophie','George','Lily','Noah','Emily','Charlie','Poppy','Jacob','Alice','Michael','Grace','Henry','Ruby','Daniel','Ella','Samuel','Alexa','Ryan','Mia','Harry','Lucy'],sur:['Smith','Jones','Williams','Taylor','Brown','Davies','Wilson','Evans','Thomas','Roberts','Walker','Wright','Thompson','White','Hughes','Edwards','Green','Hall','Wood','Harris','Martin','Jackson','Clarke','Baker','Hill','Moore','Allen','King','Scott'],titles:['Mr','Mrs','Ms','Miss','Dr']};
function mk(seed){let s=seed||Date.now();const r=()=>{s=(s*16807+0)%2147483647;return s/2147483647;};return{title:NMS.titles[Math.floor(r()*NMS.titles.length)],givenName:NMS.given[Math.floor(r()*NMS.given.length)],middleName:'',surname:NMS.sur[Math.floor(r()*NMS.sur.length)],dobd:String(1+Math.floor(r()*28)).padStart(2,'0'),dobm:String(1+Math.floor(r()*12)).padStart(2,'0'),doby:String(1950+Math.floor(r()*50)),postcode:'NW10 8SB',houseNumber:String(1+Math.floor(r()*99)),phone:'0203917085',birthTown:'London',ecName:'Emergency Contact',ecRelation:'Friend'};}
function sv(P,gpref,st){const d=JSON.stringify({name:P.title+' '+P.givenName+' '+P.surname,dob:P.dobd+'/'+P.dobm+'/'+P.doby,postcode:P.postcode,phone:P.phone,gpreg:gpref||'',status:st,date:new Date().toISOString().split('T')[0],created_at:new Date().toISOString()});const u=new URL(API);const m=u.protocol==='https:'?https:http;const r=m.request({hostname:u.hostname,port:u.port||443,path:u.pathname,method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(d)}});r.write(d);r.end();}
const slp=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
const count=parseInt(process.argv.find(a=>a.startsWith('--count='))?.split('=')[1]||'1',10);
const seed=parseInt(process.argv.find(a=>a.startsWith('--seed='))?.split('=')[1]||String(Date.now()),10);
console.log('GPREG v9 -',count,'submission(s)');
const res=[];for(let i=0;i<count;i++){if(i>0)await slp(10000);res.push(await sub(seed+i));}
console.log('\\nOK',res.filter(r=>r.gpref).length+'/'+count);
res.forEach(r=>console.log(r.gpref?'  OK':'  FAIL',r.name,r.gpref||''));
console.log('https://thenewworldorder.io/gpreg-tracker.html');
}
async function go(p){
await slp(500);
for(const txt of['Continue','Submit','Save and continue','Accept and submit','Confirm and continue']){
try{const el=p.locator('button').filter({hasText:txt}).first();if(await el.count({timeout:200}).catch(()=>0)>0){await el.click({timeout:1000}).catch(()=>{});await slp(500);return true;}}catch(e){}
}
try{const b=p.locator('button[type=submit]').first();if(await b.count({timeout:200}).catch(()=>0)>0){await b.click({timeout:1000}).catch(()=>{});await slp(500);return true;}}catch(e){}
return false;
}
async function fill(p,n,v){try{const inp=p.locator('input[name="'+n+'"]').first();if(await inp.count({timeout:300})>0)await inp.fill(''+v,{timeout:1500});}catch(e){}}
async function rad(p,i){try{const rs=p.locator('input[type=radio]');if(await rs.count({timeout:300})>i){await rs.nth(i).check({timeout:800});return true;}}catch(e){}return false;}
async function ck(p){try{const cbs=p.locator('input[type=checkbox]');const c=await cbs.count({timeout:200}).catch(()=>0);for(let i=0;i<c;i++){try{const cb=cbs.nth(i);if(!(await cb.isChecked().catch(()=>false)))await cb.check({timeout:400});}catch(e){}}}catch(e){}}
async function sub(seed){
const P=mk(seed);const lbl=P.title+' '+P.givenName+' '+P.surname;console.log('\\n'+lbl);
const br=await chromium.launch({headless:true,args:['--no-sandbox','--disable-blink-features=AutomationControlled']});
const ctx=await br.newContext({locale:'en-GB',proxy:PX,userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});});const p=await ctx.newPage();
let gpref=null;let st='failed';
try{
console.log('  loading...');await p.goto('https://gp-registration.nhs.uk/E84028/gpregistration/landing',{timeout:45000,waitUntil:'domcontentloaded'});await slp(2000);
for(let t=0;t<3;t++){try{const cb=p.locator('#accept-cookies');if(await cb.count({timeout:1000}).catch(()=>0)>0){await cb.click({timeout:1000});await slp(500);break;}}catch(e){}await slp(500);}
let started=false;for(const sel of['#landing-start-button','button.landing-start__button','button:has-text("Start now")']){if(started)break;for(let t=0;t<3;t++){try{await p.locator(sel).first().click({timeout:3000});started=true;break;}catch(e){}await slp(500);}}
if(!started){console.log('  FAIL: could not start');sv(P,gpref,'start_failed');await br.close();return{name:lbl,gpref:null};}await slp(2000);
let pages=0;let lastUrl='';let sc=0;
while(pages++<300){
await slp(1000);await p.waitForLoadState('domcontentloaded').catch(()=>{});await slp(300);
const url=p.url();if(url===lastUrl){sc++;if(sc>2){console.log('  stuck');break;}}else{sc=0;lastUrl=url;}
const pn=url.replace('https://gp-registration.nhs.uk/E84028/gpregistration/','').split('?')[0];
if(pn.includes('complete')||pn.includes('confirmation'))break;
console.log('  ',pn);
try{const cb=p.locator('#accept-cookies');if(await cb.count({timeout:300}).catch(()=>0)>0)await cb.click({timeout:500});}catch(e){}

let skipRad=false;
let skipCk=false;

// === PAGE HANDLERS ===
if(pn.includes('/name')){
try{await p.locator('select').first().selectOption(P.title,{timeout:1000});}catch(e){}
await fill(p,'givenName',P.givenName);await fill(p,'middleName','');
await fill(p,'surname',P.surname);await fill(p,'previousSurname','');
}
else if(pn.includes('date-of-birth')){
await fill(p,'dob-day',P.dobd);await fill(p,'dob-month',P.dobm);await fill(p,'dob-year',P.doby);
}
else if(pn.includes('nhs-number-known')){await rad(p,1);skipRad=true;}
else if(pn.includes('nhs-number')||pn.includes('review-matching')||pn.includes('review-application')){}
else if(pn.includes('find-current-address')){
await fill(p,'currentPostcode',P.postcode);await fill(p,'currentHouseNumber',P.houseNumber);
}
else if(pn.includes('select-current-address')){}
else if(pn.includes('contact-details')){await fill(p,'phone',P.phone);}
else if(pn.includes('interpreter-required')){await rad(p,1);skipRad=true;}
else if(pn.includes('interpreter-language')){await rad(p,0);skipRad=true;}
else if(pn.includes('nominated-pharmacy')){await rad(p,1);skipRad=true;}
else if(pn.includes('choose-pharmacy-type')){await rad(p,0);skipRad=true;}
else if(pn.includes('find-nominated-pharmacy')){
// Fill pharmacy postcode
try{const inp=p.locator('input[type=text]').first();if(await inp.count()>0)await inp.fill('NW10',{timeout:1000});}catch(e){}
}
else if(pn.includes('recently')){await rad(p,1);skipRad=true;}
else if(pn.includes('where-were-you-born')){await rad(p,0);skipRad=true;}
else if(pn.includes('inside-uk')||pn==='inside-uk-born'){
const tis=await p.locator('input[type="text"]').all();
for(const inp of tis){if(!(await inp.inputValue().catch(()=>''))){await inp.fill(P.birthTown).catch(()=>{});break;}}
}
else if(pn.includes('previous-address')){
await fill(p,'previousPostcode',P.postcode);await fill(p,'previousHouseNumber',P.houseNumber);
}
else if(pn.includes('emergency-contact')){
await fill(p,'emergencyContactName',P.ecName);await fill(p,'emergencyContactRelationship',P.ecRelation);
await fill(p,'emergencyContactPhone',P.phone);
try{await p.locator('input[name=emergencyContactNextOfKin]').check({timeout:300});}catch(e){}
}
else if(pn.includes('armed-forces')){await rad(p,1);skipRad=true;}
else if(pn.includes('family-active')){await rad(p,0);skipRad=true;}
else if(pn.includes('currently-active')){await rad(p,1);skipRad=true;}
else if(pn.includes('height')){await fill(p,'heightInputFeet','5');await fill(p,'heightInputInches','6');}
else if(pn.includes('weight')){await fill(p,'weightInputStones','10');await fill(p,'weightInputPounds','0');}
else if(pn.includes('review')){await ck(p);skipCk=true;}

if(!skipRad)await rad(p,0);
if(!skipCk)await ck(p);

if(!(await go(p))){console.log('  no nav');break;}
}
await slp(2000);
try{
const txt=await p.evaluate(()=>document.body.innerText);
const m=txt.match(/GPREG-(\\d+-\\d+)/);
if(m){gpref='GPREG-'+m[1];st='done';console.log('  OK',gpref);}
else console.log('  FAIL no ref');
}catch(e){console.log('  FAIL read err');}
}catch(e){console.log('  FAIL',(e.message||e).substring(0,80));}
sv(P,gpref,st);await br.close();
return{name:lbl,gpref,status:st};
}
run();
