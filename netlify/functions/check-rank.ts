import { Handler } from '@netlify/functions'
import SerpApi from "google-search-results-nodejs";

interface SearchResult {
  organic_results?: Array<{
    link: string;
    title: string;
    position: number;
  }>;
}

if (!process.env.SERPAPI_KEY) {
  throw new Error('SERPAPI_KEY is not defined');
}

const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY as string);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  const { keyword, url } = JSON.parse(event.body || '{}')
  const cleanUrl = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  try {
    const searchResults = await new Promise<SearchResult>((resolve) => {
      search.json({
        q: keyword,
        num: 100,
        hl: "tr",
        gl: "tr",
        device: "mobile",
        google_domain: "google.com.tr"
      }, resolve);
    });

    let rank = -1
    let foundUrl = ''

    searchResults.organic_results?.forEach((result, index) => {
      const resultUrl = result.link.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
      if (resultUrl.includes(cleanUrl) || cleanUrl.includes(resultUrl)) {
        rank = index + 1
        foundUrl = result.link
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rank: rank === -1 ? 'İlk 100 mobil sonuç içinde bulunamadı' : rank,
        foundUrl,
        searchedUrl: cleanUrl,
        timestamp: new Date().toISOString(),
        topResults: searchResults.organic_results?.slice(0, 10).map(result => ({
          position: result.position,
          title: result.title,
          link: result.link
        }))
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Arama sırasında bir hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
