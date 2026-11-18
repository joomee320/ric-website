import { expect, test } from 'vitest';
import fallback from '../../content.fallback.json';
import { getContent } from '../../lib/cms/getContent';
import { SiteContentSchema } from '../../lib/cms/schema';

test('Error handling: content.fallback.json passes the strict schema', () => {
  expect(SiteContentSchema.safeParse(fallback).success).toBe(true);
});

test('Architecture: getContent returns the fallback while no snapshot store exists', async () => {
  expect(await getContent()).toEqual(fallback);
});
