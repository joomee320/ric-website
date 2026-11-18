/**
 * Placeholder shown by pages that are planned but not built yet
 * (docs/decisions.md D12). Delete once every page is implemented.
 */
export function StubNotice({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>This page is not built yet.</p>
    </main>
  );
}
