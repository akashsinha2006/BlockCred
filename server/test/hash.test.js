import test from 'node:test';
import assert from 'node:assert/strict';
import { signPayload, signaturesMatch, canonicalJson, credentialPayload } from '../src/utils/hash.js';

const base = {
  credentialId: 'BC-TEST', studentName: 'Demo Student', studentIdentifier: 'S-1', institution: 'Demo Uni',
  qualification: 'BSc', department: 'CS', graduationYear: 2026, issueDate: '2026-05-01',
};

test('signature is deterministic and key-order independent', () => {
  const reordered = Object.fromEntries(Object.entries(base).reverse());
  assert.equal(signPayload(credentialPayload(base), 's'), signPayload(credentialPayload(reordered), 's'));
  assert.match(signPayload(base, 's'), /^[0-9a-f]{64}$/);
});

test('any field change alters the signature', () => {
  const a = signPayload(credentialPayload(base), 's');
  assert.ok(!signaturesMatch(a, signPayload(credentialPayload({ ...base, studentName: 'Someone Else' }), 's')));
});

test('a different secret gives a different signature', () => {
  assert.notEqual(signPayload(base, 'one'), signPayload(base, 'two'));
});

test('canonical json sorts keys', () => {
  assert.equal(canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
});
