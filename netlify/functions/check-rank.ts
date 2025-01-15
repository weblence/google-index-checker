import { Handler } from '@netlify/functions'
import SerpApi from "google-search-results-nodejs";

const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  const { keyword, url } = JSON.parse(event.body || '{}')
  const cleanUrl = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  try {
    const searchResults = await new Promise((resolve) => {
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
      body: JSON.stringify({
        rank: rank === -1 ? 'İlk 100 mobil sonuç içinde bulunamadı' : rank,
        foundUrl,
        searchedUrl: cleanUrl,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Arama sırasında bir hata oluştu',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
