export {};

declare global {
  type HeadersInit = Record<string, string> | Array<[string, string]>;
}
