import {test} from 'node:test';
import assert from 'node:assert/strict';
import {passwordIssue} from '../src/accounts/passwords.js';
test('Passwords require matching confirmation and safe UTF-8 length without changing input',()=>{
 assert.match(passwordIssue('short','short'),/at least 8/);
 assert.match(passwordIssue('long-enough','different'),/do not match/);
 assert.equal(passwordIssue('Correct-password 42!','Correct-password 42!'),'');
 const tooLong='密'.repeat(25);assert.match(passwordIssue(tooLong,tooLong),/too long/);
 const boundary='x'.repeat(72);assert.equal(passwordIssue(boundary,boundary),'');
 assert.match(passwordIssue('🙂'.repeat(7),'🙂'.repeat(7)),/at least 8/);
 assert.equal(passwordIssue('🙂'.repeat(8),'🙂'.repeat(8)),'');
 assert.match(passwordIssue(null,null),/at least 8/);
});
