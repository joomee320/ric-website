import { expect, test } from 'vitest';
import * as route from '../../app/api/publish/route';

// The route is a stub until step 5 (docs/decisions.md D12). These tests pin the
// stub's contract and are replaced by the real Publish API tests in step 5.

test('Publish API (stub): POST answers 501 not_implemented', async () => {
  const response = await route.POST();
  expect(response.status).toBe(501);
  expect(await response.json()).toEqual({ ok: false, error: 'not_implemented' });
});

test('Publish API: only POST is exported, so GET cannot publish', () => {
  expect(Object.keys(route)).toEqual(['POST']);
});
