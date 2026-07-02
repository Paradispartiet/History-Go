export {};

declare global {
  interface Window {
    [key: string]: any;
  }

  interface Element {
    dataset: DOMStringMap;
    disabled?: boolean;
  }

  interface EventTarget {
    getAttribute?: (qualifiedName: string) => string | null;
    textContent?: string | null;
    disabled?: boolean;
  }

  interface Event {
    detail?: any;
  }
}
