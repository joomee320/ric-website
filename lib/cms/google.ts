// Reads the content Doc from the Google Docs API with the service account
// (docs/spec.md → Tech stack; docs/decisions.md D6).
// Server-only: holds credentials and must never be bundled for the browser.

import 'server-only';
import { auth, docs } from '@googleapis/docs';
import type { DocsDocument } from './flatten';

const SCOPES = ['https://www.googleapis.com/auth/documents.readonly'];
const REQUIRED_ENV = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'DOC_ID'] as const;

/** Thrown when env vars are missing. The message names them, never their values. */
export class MissingEnvError extends Error {
  readonly names: string[];

  constructor(names: string[]) {
    super(`Missing environment variables: ${names.join(', ')}`);
    this.name = 'MissingEnvError';
    this.names = names;
  }
}

/**
 * Fetches the content Doc. Reads only the first Doc tab (`body`), so the
 * content Doc must not use Docs tabs. Throws on any failure; loadContent()
 * turns that into `fetch_failed`.
 */
export async function fetchDoc(
  env: Record<string, string | undefined> = process.env,
): Promise<DocsDocument> {
  const missing = REQUIRED_ENV.filter((name) => !env[name]?.trim());
  if (missing.length > 0) throw new MissingEnvError(missing);

  const client = new auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL!.trim(),
    // Stored with literal "\n" escapes in env files and Vercel; restore real newlines.
    key: env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const response = await docs({ version: 'v1', auth: client }).documents.get({
    documentId: env.DOC_ID!.trim(),
  });
  return response.data;
}
