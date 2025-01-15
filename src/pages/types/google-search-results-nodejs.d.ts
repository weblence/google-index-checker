declare module 'google-search-results-nodejs' {
  interface SearchParams {
    q: string;
    num?: number;
    hl?: string;
    gl?: string;
    device?: string;
    google_domain?: string;
  }

  interface SearchResponse {
    organic_results?: Array<{
      link: string;
      title: string;
      snippet: string;
      position: number;
    }>;
    search_metadata?: {
      status: string;
      created_at: string;
      processed_at: string;
      total_time_taken: number;
    };
  }

  export class GoogleSearch {
    constructor(apiKey: string);
    json(
      params: SearchParams,
      callback: (data: SearchResponse) => void
    ): void;
  }
}
