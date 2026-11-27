const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const old={id:'old',name:'Old',email:'old@example.invalid',token:'old-token',expiresAt:'2099-01-01T00:00:00Z'};
const next={...old,id:'new',name:'New',email:'new@example.invalid',token:'new-token'};
function response(user=old){return {user:{consumerUserId:user.id,email:user.email,displayName:user.name,avatarDataUrl:null,createdAt:'2026-01-01T00:00:00Z'},token:user.token,expiresAt:user.expiresAt};}
function harness(){
 const storage=new Map([['koi_auth_user',JSON.stringify(old)]]);global.window={};global.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 const pending=[];global.fetch=(url,init)=>new Promise(resolve=>pending.push({url,init,finish:(body,status=200)=>resolve(new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}}))}));
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/lib/auth-utils.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};new Function('exports',code)(exports);return {...exports,pending,stored:()=>JSON.parse(storage.get('koi_auth_user')??'null')};
}
test('late session refresh cannot restore a logged-out account',async()=>{
 const h=harness();const refresh=h.refreshSession();const logout=h.logout();assert.equal(h.stored(),null);h.pending[0].finish(response());assert.equal(await refresh,null);assert.equal(h.stored(),null);h.pending[1].finish({});await logout;
});
test('old authentication failure cannot clear a new login',async()=>{
 const h=harness();const refresh=h.refreshSession();const login=h.login(next.email,'test-password');h.pending[1].finish(response(next));await login;h.pending[0].finish({detail:'Expired'},401);assert.equal((await refresh).id,'new');assert.equal(h.stored().id,'new');
});
test('late profile save cannot overwrite a different account',async()=>{
 const h=harness();const profile=h.updateProfile({displayName:'Old edited'});const login=h.login(next.email,'test-password');h.pending[1].finish(response(next));await login;h.pending[0].finish(response());assert.equal(await profile,null);assert.equal(h.stored().id,'new');
});
test('logout clears local access immediately and cannot erase a subsequent login',async()=>{
 const h=harness();const logout=h.logout();assert.equal(h.stored(),null);assert.equal(h.pending[0].init.headers.Authorization,'Bearer old-token');const login=h.login(next.email,'test-password');h.pending[1].finish(response(next));await login;h.pending[0].finish({});await logout;assert.equal(h.stored().id,'new');
});
test('overlapping sign-ins keep the most recent action',async()=>{
 const h=harness();const first=h.login(old.email,'first-password');const second=h.login(next.email,'next-password');h.pending[1].finish(response(next));assert.equal((await second).user.id,'new');h.pending[0].finish(response(old));assert.equal((await first).user,null);assert.equal(h.stored().id,'new');
});
test('pending sign-in cannot overwrite a session changed in another tab',async()=>{
 const h=harness();const login=h.login(old.email,'password');localStorage.setItem('koi_auth_user',JSON.stringify(next));h.pending[0].finish(response(old));assert.equal((await login).user,null);assert.equal(h.stored().id,'new');
});
