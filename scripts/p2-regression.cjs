const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VERIFICATION_BASE||'http://localhost:3105',slug='music-lollipop-demo-2026';
const proofNotice='Your draft expired and has been replaced.';
(async()=>{
 const {campaign}=await (await fetch('https://koi-recall-backend.vercel.app/v1/recall-campaigns/'+slug)).json();
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 for(const mode of ['upload','refresh','remove','expired','submit-expired','server-expired','labels-es']) {
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),p=await ctx.newPage();p.setDefaultTimeout(15000);
  let release,start;const started=new Promise(r=>start=r),waiting=new Promise(r=>release=r);let creates=0,posts=0;
  const requiredDocs=campaign.evidenceRequirements.filter(r=>['product_photo','proof_of_purchase','incident_evidence'].includes(r.category)).flatMap(r=>Array.from({length:Math.max(r.minimumFiles,r.required?1:0)},(_,i)=>({documentId:r.category+'-'+i,category:r.category,fileName:'audit.jpg',status:'verified'})));
  const snap={draftId:'21326c9a-5dc2-430f-98a6-546729a1065f',draftToken:'local-test-only-'.repeat(3),expiresAt:mode==='expired'?'2020-01-01T00:00:00Z':'2099-01-01T00:00:00Z',idempotencyKey:'local-audit',currentStep:'consumer',remedyCode:'replacement',documents:['submit-expired','server-expired'].includes(mode)?requiredDocs:mode==='remove'?[{documentId:'existing',category:'product_photo',fileName:'existing.jpg',status:'failed'}]:mode==='refresh'?[{documentId:'existing',category:'product_photo',fileName:'existing.jpg',status:'verifying'}]:[],form:{locale:'en-US',incidentAnswer:'no',eventTypes:[],privacyAccepted:true,accuracyAccepted:true,product:{campaignProductId:campaign.products[0].productId,quantity:1,purchaseChannel:'gift',lotCode:'',dateCode:'',flavor:'',shape:''}}};
  await ctx.addInitScript(({slug,snap})=>{if(!sessionStorage.getItem('koi_claim_flow:'+slug))sessionStorage.setItem('koi_claim_flow:'+slug,JSON.stringify(snap));},{slug,snap});
  const runtime=[];p.on('pageerror',e=>runtime.push(e.message));
  await ctx.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());if(u.origin===base)return route.continue();
   const headers={'access-control-allow-origin':base,'access-control-allow-methods':'*','access-control-allow-headers':'*'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});let status=200,data;
   if(u.pathname.endsWith('/claim-drafts')){creates++;data={draftId:'new-draft-'+creates,draftToken:'new-local-token',expiresAt:'2099-01-01T00:00:00Z'};}
   else if(u.pathname.endsWith('/upload-tokens')){start();await waiting;data={documentId:'new-photo',pathname:'audit/local-photo.jpg',clientToken:'invalid-local-token',expiresAt:'2099-01-01T00:00:00Z'};}
   else if(u.pathname.endsWith('/claims')&&req.method()==='POST'){posts++;status=410;data={status:410,type:'about:blank',title:'Gone',detail:'Expired draft'};}
   else if(req.method()==='DELETE'){start();await waiting;data={};}
   else if(u.pathname.endsWith('/documents')){if(mode==='refresh'){start();await waiting;}data={documents:mode==='refresh'?[{documentId:'existing',category:'product_photo',fileName:'existing.jpg',status:'verified'}]:[]};}
   else{status=401;data={status,title:'Blocked',detail:'Regression test blocked external traffic.',type:'about:blank'};}
   return route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
  });
  await p.goto(base+'/recalls/'+slug+'?lang='+(mode==='labels-es'?'es':'en'));
  if(mode==='expired'){
   await p.getByText(proofNotice,{exact:false}).waitFor();assert.equal(creates,1);
   const saved=await p.evaluate(slug=>JSON.parse(sessionStorage.getItem('koi_claim_flow:'+slug)),slug);assert.equal(saved.draftId,'new-draft-1');assert.deepEqual(saved.documents,[]);
   console.log('PASS expired persisted draft replaced before editing');
  }else{
   await p.locator('#first-name').waitFor();
   if(mode==='upload'){
    await p.locator('#first-name').fill('BEFORE');await p.locator('input[type=file]').first().setInputFiles({name:'audit.jpg',mimeType:'image/jpeg',buffer:Buffer.from('test')});await started;await p.locator('#first-name').fill('EDITED_DURING_UPLOAD');release();await p.getByText('Upload failed',{exact:true}).waitFor();assert.equal(await p.locator('#first-name').inputValue(),'EDITED_DURING_UPLOAD');
    const docs=await p.evaluate(slug=>JSON.parse(sessionStorage.getItem('koi_claim_flow:'+slug)).documents,slug);assert.equal(docs.length,1);console.log('PASS failed upload preserves concurrent edits and persists receipt');
   }else if(mode==='refresh'||mode==='remove'){
    if(mode==='remove')await p.getByRole('button',{name:'Remove existing.jpg',exact:true}).click();await started;await p.locator('#first-name').fill('EDITED_DURING_ASYNC');release();
    if(mode==='remove')await p.getByText('existing.jpg',{exact:true}).waitFor({state:'hidden'});else await p.getByText('Verified',{exact:true}).waitFor();assert.equal(await p.locator('#first-name').inputValue(),'EDITED_DURING_ASYNC');console.log('PASS '+mode+' preserves concurrent edits');
   }else if(mode==='labels-es'){
    const labels=await p.locator('input[type=file]').evaluateAll(nodes=>nodes.map(n=>n.parentElement.textContent));assert.equal(labels.length,3);assert.ok(labels.every(x=>x.includes('Añadir')&&!x.includes('ui.')));console.log('PASS Spanish upload labels contain translated category names');
   }else{
    for(const [id,value]of[['first-name','KEEP_THIS_NAME'],['last-name','User'],['email','test@example.invalid'],['address-line1','123 Test Street'],['city','Austin'],['state','TX'],['postal-code','78701']])await p.locator('#'+id).fill(value);
    if(mode==='submit-expired'){await p.clock.install({time:new Date('2100-01-01T00:00:00Z')});}
    await p.getByRole('button',{name:'Submit Through API',exact:true}).click();await p.getByText(proofNotice,{exact:false}).waitFor();assert.equal(creates,1);assert.equal(posts,mode==='server-expired'?1:0);assert.equal(await p.locator('#first-name').inputValue(),'KEEP_THIS_NAME');
    const saved=await p.evaluate(slug=>JSON.parse(sessionStorage.getItem('koi_claim_flow:'+slug)),slug);assert.equal(saved.draftId,'new-draft-1');assert.deepEqual(saved.documents,[]);console.log('PASS '+mode+' replaces draft, clears stale attachments, preserves entered form');
   }
  }
  assert.deepEqual(runtime,[]);await ctx.close();
 }
 for(const path of ['/claims','/dashboard']){
  const ctx=await browser.newContext(),p=await ctx.newPage();let mode='failure',reads=0;
  const user={id:'test-user',email:'owner@example.invalid',name:'Test Owner',token:'local-test-token',expiresAt:'2099-01-01T00:00:00Z',claimsAccessVerified:true};
  await ctx.addInitScript(user=>localStorage.setItem('koi_auth_user',JSON.stringify(user)),user);
  await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin===base)return route.continue();const headers={'access-control-allow-origin':base,'access-control-allow-methods':'*','access-control-allow-headers':'*'};if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});let status=200,data;
   if(u.pathname.endsWith('/me'))data={user:{consumerUserId:user.id,email:user.email,displayName:user.name,claimsAccessVerified:true}};
   else if(u.pathname.endsWith('/consumer-auth/claims')){reads++;status=mode==='failure'?503:mode==='unauthorized'?401:200;data=status===200?{claims:[]}:{status,title:'Unavailable',detail:'Do not expose backend text',type:'about:blank'};}
   else{status=401;data={status,title:'Blocked',detail:'Blocked',type:'about:blank'};}return route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
  });
  await p.goto(base+path+'?lang=en');await p.getByText('Your claims could not be loaded.',{exact:true}).waitFor();assert.equal(await p.getByText('No Claims Found',{exact:true}).count(),0);assert.equal(await p.getByText('Do not expose backend text',{exact:true}).count(),0);
  mode='empty';await p.getByRole('button',{name:'Try again',exact:true}).click();await p.getByText('Your claims could not be loaded.',{exact:true}).waitFor({state:'hidden'});assert.ok(reads>=2);
  mode='unauthorized';await p.reload();await p.getByRole('button',{name:'Sign in again',exact:true}).waitFor();console.log('PASS '+path+' distinguishes errors, retries, empty success and expired login');await ctx.close();
 }
 const ctx=await browser.newContext(),p=await ctx.newPage();await p.goto(base+'/?lang=en');const footer=p.locator('footer');assert.equal(await footer.getByRole('link',{name:'Terms of Service',exact:true}).count(),0);assert.equal(await footer.getByRole('link',{name:'Accessibility',exact:true}).count(),0);assert.equal(await footer.getByRole('link',{name:'Contact Support',exact:true}).getAttribute('href'),'/#active-recalls');await footer.getByRole('link',{name:'Contact Support',exact:true}).click();await p.waitForURL('**/#active-recalls');assert.equal(new URL(p.url()).hash,'#active-recalls');await p.locator('#active-recalls').waitFor();console.log('PASS footer removes misleading legal links and directs support to recall contacts');await ctx.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
