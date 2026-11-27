const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.VERIFICATION_BASE||'http://localhost:3105';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const path of ['/claims/KOI-TEST-12345678','/dashboard/claims/KOI-TEST-12345678']){
  const ctx=await browser.newContext(),p=await ctx.newPage();p.setDefaultTimeout(15000);const runtime=[];p.on('pageerror',e=>runtime.push(e.message));let mode='failure',reads=0;
  const user={id:'test-user',email:'owner@example.invalid',name:'Owner',token:'test-session',expiresAt:'2099-01-01T00:00:00Z',claimsAccessVerified:true};
  await ctx.addInitScript(user=>localStorage.setItem('koi_auth_user',JSON.stringify(user)),user);
  await ctx.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin===base)return route.continue();const headers={'access-control-allow-origin':base,'access-control-allow-methods':'*','access-control-allow-headers':'*'};if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});let status=200,data;
   if(u.pathname.endsWith('/me'))data={user:{consumerUserId:user.id,email:user.email,displayName:user.name,claimsAccessVerified:true}};
   else if(u.pathname.includes('/consumer-auth/claims/')){reads++;if(mode==='network')return route.abort('failed');status=mode==='failure'?503:mode==='unauthorized'?401:mode==='missing'?404:200;data=status===200?{claim:{id:'test-claim',claimNumber:'KOI-TEST-12345678',campaignTitle:'Test campaign',productName:'Test product',remedyType:'replacement',remedyTitle:'Replacement',status:'submitted',evidenceCount:0,submittedAt:'2026-11-27T00:00:00Z'}}:{status,type:'about:blank',title:'Backend error',detail:'Do not display this backend sentence'};}
   else{status=401;data={status,type:'about:blank',title:'Blocked',detail:'Test blocked external request'};}return route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
  });
  await p.goto(base+path+'?lang=en');await p.getByText('Your claim details could not be loaded.',{exact:true}).waitFor();assert.equal(await p.getByText('Page Not Found',{exact:true}).count(),0);assert.equal(await p.getByText('Do not display this backend sentence',{exact:true}).count(),0);
  mode='success';await p.getByRole('button',{name:'Try again',exact:true}).click();await p.getByRole('heading',{name:'KOI-TEST-12345678',exact:true}).waitFor();assert.equal(reads,2);
  mode='unauthorized';await p.reload();await p.getByRole('button',{name:'Sign in again',exact:true}).waitFor();
  mode='network';await p.reload();await p.getByRole('button',{name:'Try again',exact:true}).waitFor();
  mode='missing';await p.reload();await p.getByRole('heading',{name:'Page Not Found',exact:false}).waitFor();assert.equal(await p.getByText('Your claim details could not be loaded.',{exact:true}).count(),0);
  assert.deepEqual(runtime,[]);console.log('PASS '+path+' handles 503 retry, success, 401, network failure and real 404');await ctx.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
