import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,hydrateState,createTransaction,settleTransaction,claimBonus,toggleFavorite} from '../public/state.js';
const make=(s,type='deposit',amount=100000,id='tx')=>createTransaction(s,{type,amount,id,method:'QRIS',now:'2026-11-03T12:00:00Z'});
test('deposit settles once',()=>{const b=initialState();let s=make(b);assert.equal(s.balance,b.balance);s=settleTransaction(s,'tx','completed');assert.equal(s.balance,b.balance+100000);assert.equal(settleTransaction(s,'tx','completed'),s);assert.equal(settleTransaction(s,'tx','cancelled'),s);});
test('withdraw cancellation restores once',()=>{const b=initialState();let s=make(b,'withdraw');assert.equal(s.balance,b.balance-100000);s=settleTransaction(s,'tx','cancelled');assert.equal(s.balance,b.balance);assert.equal(settleTransaction(s,'tx','cancelled'),s);});
test('completed withdrawal stays deducted',()=>{const b=initialState();const s=settleTransaction(make(b,'withdraw'),'tx','completed');assert.equal(s.balance,b.balance-100000);assert.equal(settleTransaction(s,'tx','cancelled'),s);});
test('invalid amounts and overdraw rejected',()=>{for(const a of [0,-1,9999,1.5,NaN,Infinity,10000001,'abc'])assert.throws(()=>make(initialState(),'deposit',a));assert.throws(()=>make(initialState(),'withdraw',2000000));});
test('duplicate submission idempotent',()=>{const s=make(initialState(),'withdraw');assert.equal(make(s,'withdraw'),s);assert.equal(s.transactions.length,1);});
test('guest writes rejected',()=>{const s={...initialState(),signedIn:false};assert.throws(()=>make(s));assert.throws(()=>claimBonus(s,'welcome',10000));});
test('one-time bonus',()=>{const b=initialState(),s=claimBonus(b,'welcome',10000);assert.equal(s.balance,b.balance+10000);assert.throws(()=>claimBonus(s,'welcome',10000));assert.throws(()=>claimBonus(b,'bad',-1));});
test('favorites toggle',()=>{const b=initialState(),s=toggleFavorite(b,'123');assert.deepEqual(s.favorites,['123']);assert.deepEqual(toggleFavorite(s,'123').favorites,[]);assert.equal(s.balance,b.balance);});
test('persistence roundtrip and malformed input',()=>{const s=make(initialState());assert.deepEqual(hydrateState(JSON.parse(JSON.stringify(s))),s);assert.equal(hydrateState({version:0}).version,1);assert.equal(hydrateState({version:1,balance:-1}).balance,1250000);});

test('malformed last played data cannot restore a game card',()=>{
 for(const lastPlayed of [null,[],{},'bad',{gameId:'../bad',playedAt:'2026-11-04'},{gameId:'valid',playedAt:'invalid'}])assert.equal(hydrateState({version:1,lastPlayed}).lastPlayed,null);
 assert.deepEqual(hydrateState({version:1,lastPlayed:{gameId:'soft-tech-uno-luck',playedAt:'2026-11-04T00:00:00Z',dismissed:true}}).lastPlayed,{gameId:'soft-tech-uno-luck',playedAt:'2026-11-04T00:00:00Z',dismissed:true});
});
