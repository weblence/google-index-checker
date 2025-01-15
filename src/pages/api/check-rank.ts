import type { NextApiRequest, NextApiResponse } from 'next'
import SerpApi from "google-search-results-nodejs";

if (!process.env.SERPAPI_KEY) {
  throw new Error('SERPAPI_KEY is not defined');
}

const search = new SerpApi.GoogleSearch(process.env.SERPAPI_KEY as string);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { keyword, url } = req.body
  const cleanUrl = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  try {
    const searchResults = await new Promise((resolve, reject) => {
      search.json({
        q: keyword,
        num: 100,
        hl: "tr",
        gl: "tr",
        device: "mobile",
        google_domain: "google.com.tr"
      }, (result: any) => resolve(result));
    });

    let rank = -1
    let foundUrl = ''

    searchResults.organic_results?.forEach((result: any, index: number) => {
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
      error: error.message
    })
  }
}
