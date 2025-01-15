'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearchOutline, IoGlobeOutline, IoTimeOutline, IoStatsChartOutline, IoChevronDownOutline } from 'react-icons/io5';

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
  const [isResultsOpen, setIsResultsOpen] = useState(true);

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
      const response = await fetch('/api/check-rank', {
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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0F1C] to-black overflow-x-hidden">
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10" />
        
        <div className="relative z-10 container mx-auto min-h-screen p-4 md:p-6 lg:p-8">
          <div className="flex flex-col min-h-screen">
            {/* Header Bölümü - Daha kompakt */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 md:pt-6 pb-6 text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                XN
              </h1>
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="h-[1.5px] w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em]"
                >
                  Google Sıra Bulucu
                </motion.p>
                <span className="h-[1.5px] w-16 bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
              </div>
            </motion.div>

            {/* Ana İçerik - Optimize edilmiş spacing */}
            <div className="flex-grow flex flex-col items-center justify-start pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 shadow-2xl"
              >
                <form onSubmit={checkRank} className="space-y-5">
                  <div className="space-y-2">
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
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Aramak istediğiniz kelime"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
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
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        placeholder="https://example.com (İsteğe bağlı)"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: countdown > 0 ? 1 : 1.01 }}
                    whileTap={{ scale: countdown > 0 ? 1 : 0.99 }}
                    type="submit"
                    disabled={loading || countdown > 0}
                    className={`w-full ${
                      countdown > 0 
                        ? 'bg-gray-600 hover:bg-gray-600' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    } text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/20`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : countdown > 0 ? (
                      <>
                        <IoTimeOutline className="text-lg" />
                        {countdown} saniye bekleyin
                      </>
                    ) : (
                      <>
                        <IoSearchOutline className="text-lg" />
                        Sıra Bul
                      </>
                    )}
                  </motion.button>
                </form>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-4 overflow-hidden"
                    >
                      {url && (
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="p-5 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/[0.05] rounded-xl"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-blue-500/10 rounded-lg shrink-0">
                              <IoStatsChartOutline className="text-xl text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-base font-medium text-white">
                                Sıralama Sonucu
                              </h3>
                              <p className="mt-1.5 text-gray-300">
                                Siteniz &quot;{keyword}&quot; araması için {result.rank}. sırada
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(result.timestamp).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {result.topResults && result.topResults.length > 0 && (
                        <div className="relative bg-white/[0.01] rounded-xl border border-white/[0.05]">
                          <motion.button
                            onClick={() => setIsResultsOpen(!isResultsOpen)}
                            className="w-full flex items-center justify-between p-4 text-white hover:bg-white/[0.02] rounded-xl transition-colors"
                          >
                            <span className="text-base font-medium flex items-center gap-2">
                              <IoSearchOutline className="text-purple-400" />
                              İlk 10 Sonuç
                            </span>
                            <motion.div
                              animate={{ rotate: isResultsOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <IoChevronDownOutline className="text-lg text-gray-400" />
                            </motion.div>
                          </motion.button>

                          <AnimatePresence>
                            {isResultsOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-2 p-4">
                                  {result.topResults.map((site, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{ delay: index * 0.03 }}
                                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-all duration-200"
                                    >
                                      <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg shrink-0">
                                        {site.position}
                                      </span>
                                      <a
                                        href={site.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-blue-400 transition-colors truncate text-sm"
                                      >
                                        {site.title}
                                      </a>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="py-4 text-center text-gray-500 text-xs">
              © {new Date().getFullYear()} XN Search
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
