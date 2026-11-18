// archieml 0.5 ships no type definitions. Only the parts this repo uses.
declare module 'archieml' {
  interface LoadOptions {
    comments?: boolean;
  }
  const archieml: {
    load(input: string, options?: LoadOptions): Record<string, unknown>;
  };
  export default archieml;
}
