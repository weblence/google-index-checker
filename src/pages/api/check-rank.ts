import type { NextApiRequest, NextApiResponse } from 'next'
import SerpApi from "google-search-results-nodejs";

interface ErrorResponse {
  message: string;
  error?: string;
}

interface SuccessResponse {
  rank: number | string;
  foundUrl: string;
  searchedUrl: string;
  timestamp: string;
}

if (!process.env.SERPAPI_KEY) {
  throw new Error('SERPAPI_KEY is not defined');
}

const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { keyword, url } = req.body
  const cleanUrl = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  try {
    const searchResults = await new Promise<SerpApi.SearchResponse>((resolve) => {
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

    return res.status(200).json({ 
      rank: rank === -1 ? 'İlk 100 mobil sonuç içinde bulunamadı' : rank,
      foundUrl,
      searchedUrl: cleanUrl,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({ 
      message: 'Arama sırasında bir hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
