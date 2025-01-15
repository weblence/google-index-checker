declare module 'google-search-results-nodejs' {
    export class GoogleSearch {
      constructor(apiKey: string);
      json(
        params: Record<string, any>,
        callback: (data: any) => void
      ): void;
    }
  }
  