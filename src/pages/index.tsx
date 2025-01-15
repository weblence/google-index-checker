'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { IoSearchOutline, IoGlobeOutline, IoTimeOutline, IoStatsChartOutline } from 'react-icons/io5';

interface SearchResult {
  rank: string | number;
  foundUrl: string;
  searchedUrl: string;
  timestamp: string;
  topResults?: Array<{
    position: number;
    title: string;
    link: string;
  }>;
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const checkRank = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lastSearchTime = localStorage.getItem('lastSearchTime');
    const now = Date.now();
    
    if (lastSearchTime && now - parseInt(lastSearchTime) < 30000) {
      const remainingTime = Math.ceil((30000 - (now - parseInt(lastSearchTime))) / 1000);
      setCountdown(remainingTime);
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/.netlify/functions/check-rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, url }),
      });
      
      const data = await response.json();
      setResult(data);
      localStorage.setItem('lastSearchTime', now.toString());
      setCountdown(30);
    } catch {
      setResult({
        rank: 'Bir hata oluştu',
        foundUrl: '',
        searchedUrl: '',
        timestamp: new Date().toISOString(),
        topResults: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>XN - Google Sıra Bulucu</title>
        <meta name="description" content="Google arama sonuçlarında web sitenizin sıralamasını bulun" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#0A0F1C] bg-gradient-to-b from-gray-900 to-[#0A0F1C]">
        {/* Arkaplan Efektleri */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="fixed inset-0 bg-gradient-to-tr from-[#0A0F1C] via-transparent to-transparent opacity-60" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
              XN
            </h1>
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="h-[1px] w-20 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-sm font-medium uppercase tracking-widest"
              >
                Google Sıra Bulucu
              </motion.p>
              <span className="h-[1px] w-20 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
          </motion.div>

          {/* Ana Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 shadow-2xl"
          >
            <form onSubmit={checkRank} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-gray-300 text-sm font-medium">
                  Anahtar Kelime
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoSearchOutline className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Aramak istediğiniz kelime"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-gray-300 text-sm font-medium">
                  Web Sitesi URL
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IoGlobeOutline className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: countdown > 0 ? 1 : 1.02 }}
                whileTap={{ scale: countdown > 0 ? 1 : 0.98 }}
                type="submit"
                disabled={loading || countdown > 0}
                className={`w-full ${
                  countdown > 0 
                    ? 'bg-gray-600 hover:bg-gray-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                } text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : countdown > 0 ? (
                  <>
                    <IoTimeOutline className="text-xl" />
                    {countdown} saniye bekleyin
                  </>
                ) : (
                  <>
                    <IoSearchOutline className="text-xl" />
                    Sıra Bul
                  </>
                )}
              </motion.button>
            </form>

            {/* Sonuçlar */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="p-6 bg-white/[0.03] border border-white/[0.1] rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <IoStatsChartOutline className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        Sıralama Sonucu
                      </h3>
                      <p className="mt-2 text-gray-300">
                        Siteniz "{keyword}" araması için {result.rank}. sırada
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>

                {result.topResults && result.topResults.length > 0 && (
                  <div className="p-6 bg-white/[0.03] border border-white/[0.1] rounded-xl">
                    <h3 className="text-lg font-medium text-white mb-4">
                      İlk 10 Sonuç
                    </h3>
                    <div className="space-y-3">
                      {result.topResults.map((site, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg">
                            {site.position}
                          </span>
                          <a
                            href={site.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-blue-400 transition-colors truncate"
                          >
                            {site.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
