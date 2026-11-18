import { beforeEach, describe, expect, test, vi } from 'vitest';

// Replace the Google client with fakes: these tests never call the network.
const mocks = vi.hoisted(() => ({
  JWT: vi.fn(),
  get: vi.fn(),
  docs: vi.fn(),
}));
vi.mock('@googleapis/docs', () => ({
  auth: { JWT: mocks.JWT },
  docs: mocks.docs,
}));

import { fetchDoc, MissingEnvError } from '../../lib/cms/google';

const ENV = {
  GOOGLE_CLIENT_EMAIL: 'cms@project.iam.gserviceaccount.com',
  GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nABC\\nDEF\\n-----END PRIVATE KEY-----\\n',
  DOC_ID: 'doc-123',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.docs.mockReturnValue({ documents: { get: mocks.get } });
  mocks.get.mockResolvedValue({ data: { body: { content: [] } } });
});

describe('Tech stack: fetchDoc (service account, documents.readonly)', () => {
  test('returns the documents.get response body', async () => {
    mocks.get.mockResolvedValue({ data: { title: 'RiC', body: { content: [{ sectionBreak: {} }] } } });
    expect(await fetchDoc(ENV)).toEqual({ title: 'RiC', body: { content: [{ sectionBreak: {} }] } });
  });

  test('requests the Doc by DOC_ID with a read-only scope', async () => {
    await fetchDoc(ENV);
    expect(mocks.JWT).toHaveBeenCalledWith(
      expect.objectContaining({
        email: ENV.GOOGLE_CLIENT_EMAIL,
        scopes: ['https://www.googleapis.com/auth/documents.readonly'],
      }),
    );
    expect(mocks.docs).toHaveBeenCalledWith(expect.objectContaining({ version: 'v1' }));
    expect(mocks.get).toHaveBeenCalledWith({ documentId: 'doc-123' });
  });

  test('Security: GOOGLE_PRIVATE_KEY "\\n" escapes are restored to newlines', async () => {
    await fetchDoc(ENV);
    expect(mocks.JWT.mock.calls[0][0].key).toBe(
      '-----BEGIN PRIVATE KEY-----\nABC\nDEF\n-----END PRIVATE KEY-----\n',
    );
  });

  test('a key that already has real newlines is left as is', async () => {
    const key = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n';
    await fetchDoc({ ...ENV, GOOGLE_PRIVATE_KEY: key });
    expect(mocks.JWT.mock.calls[0][0].key).toBe(key);
  });

  test('Docs API errors are thrown for loadContent to handle', async () => {
    mocks.get.mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }));
    await expect(fetchDoc(ENV)).rejects.toThrow('not found');
  });
});

describe('Security and secrets: missing env vars', () => {
  test('lists every missing name and calls nothing', async () => {
    const error = await fetchDoc({ GOOGLE_CLIENT_EMAIL: ENV.GOOGLE_CLIENT_EMAIL }).catch((e) => e);
    expect(error).toBeInstanceOf(MissingEnvError);
    expect(error.names).toEqual(['GOOGLE_PRIVATE_KEY', 'DOC_ID']);
    expect(mocks.JWT).not.toHaveBeenCalled();
  });

  test('blank values count as missing', async () => {
    const error = await fetchDoc({ ...ENV, DOC_ID: '   ' }).catch((e) => e);
    expect(error.names).toEqual(['DOC_ID']);
  });

  test('the error message names variables but never contains values', async () => {
    const error = await fetchDoc({ ...ENV, DOC_ID: '' }).catch((e) => e);
    expect(error.message).toBe('Missing environment variables: DOC_ID');
    expect(error.message).not.toContain(ENV.GOOGLE_CLIENT_EMAIL);
    expect(error.message).not.toContain('PRIVATE KEY-----');
  });
});
