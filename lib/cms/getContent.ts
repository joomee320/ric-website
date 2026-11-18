// The read side of the CMS: what pages call to get site content.
//
// Current state (step 3 of the CMS skeleton): returns the bundled
// content.fallback.json only. The cached snapshot read from Vercel Blob, with
// this file as the fallback, is added in the snapshot step (docs/spec.md →
// Architecture and data flow, Visitor flow).

import fallback from '../../content.fallback.json';
import { SiteContentSchema, type SiteContent } from './schema';

export async function getContent(): Promise<SiteContent> {
  return SiteContentSchema.parse(fallback);
}
