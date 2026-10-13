import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createHandler, signature } from '../server/email-service.js';
const secret = 'test-only-email-bridge-secret-32-characters';
const loadHandler = async () => ({ createHandler, signature });
const response = () => ({ code: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } });

test('bridge rejects unauthenticated, altered, stale and invalid sends without SMTP', async () => {
  const { createHandler, signature } = await loadHandler();
  let calls=0;
  const handler=createHandler({ env: { EMAIL_BRIDGE_SECRET: secret }, transport: { sendMail: async () => { calls++; } } });
  const body=()=>({ email: 'recipient@example.com', purpose: 'registration', name: 'Member', token: '123456', timestamp: Date.now(), nonce: crypto.randomBytes(16).toString('hex') });
  const run=async (b, auth=signature(b,secret), method='POST')=>{ const res=response(); await handler({ method, body:b, headers: { authorization: `Bearer ${auth}` } },res);return res; };
  assert.equal((await run(body(),'')).code,401);
  const altered=body(), sig=signature(altered,secret);altered.email='other@example.com';
  assert.equal((await run(altered,sig)).code,401);
  assert.equal((await run({...body(),timestamp:Date.now()-120000})).code,400);
  assert.equal((await run({...body(),token:'123456\n'})).code,400);
  assert.equal((await run({...body(),email:'a@example.com\r\nBcc:x@example.com'})).code,400);
  assert.equal((await run({...body(),html:'arbitrary mail'})).code,400);
  assert.equal((await run(body(),undefined,'GET')).code,405);
  assert.equal(calls,0);
});

test('Vercel awaits SMTP and returns a sanitized error when delivery fails', async () => {
  const { createHandler, signature } = await loadHandler();
  const body={email:'member@example.com',purpose:'password-reset',token:'123456',name:'',timestamp:Date.now(),nonce:'a'.repeat(32)};
  let release; const pending = new Promise(resolve=>{release=resolve;});
  const res=response();
  const handler=createHandler({env:{EMAIL_BRIDGE_SECRET:secret,SMTP_USER:'sender@example.com',SMTP_PASS:'secret'},transport:{sendMail:async()=>{await pending;throw new Error('private SMTP details');}}});
  const work=handler({method:'POST',body,headers:{authorization:`Bearer ${signature(body,secret)}`}},res);
  await new Promise(resolve=>setImmediate(resolve));assert.equal(res.body,undefined);
  release();await work;assert.equal(res.code,503);assert.deepEqual(res.body,{error:'Email delivery unavailable'});
});


test('relay builds all ShortJob templates and escapes names', async () => {
  const messages=[];
  const handler=createHandler({env:{EMAIL_BRIDGE_SECRET:secret,SMTP_USER:'sender@example.com',SMTP_PASS:'private',APP_URL:'https://shortjob.example.com'},transport:{sendMail:async m=>{messages.push(m);return {accepted:[m.to.address]};}}});
  for (const purpose of ['registration','password-reset','verification']) {
    const body={email:'member@example.com',name:'<img src=x>',purpose,token:purpose==='verification'?'a'.repeat(64):'123456',timestamp:Date.now(),nonce:crypto.randomBytes(16).toString('hex')};
    const res=response();await handler({method:'POST',body,headers:{authorization:'Bearer '+signature(body,secret)}},res);assert.equal(res.code,200);
  }
  assert.match(messages[0].html,/&lt;img src=x&gt;/);
  assert.match(messages[0].text,/10 minutes/);assert.match(messages[1].text,/15 minutes/);
  assert.match(messages[2].html,/https:\/\/shortjob.example.com\/verify-email\/a{64}/);
  assert.ok(messages.every(m=>m.from.name==='ShortJob'));
});
