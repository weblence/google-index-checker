'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { IoSearchOutline, IoGlobeOutline } from 'react-icons/io5';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
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
    setResult('Aranıyor...');
    
    try {
      const response = await fetch('/api/check-rank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keyword, 
          url: url.replace(/^https?:\/\//, '').replace(/\/$/, '') 
        }),
      });
      
      const data = await response.json();
      setResult(`Siteniz "${keyword}" araması için ${data.rank}. sırada`);
      localStorage.setItem('lastSearchTime', now.toString());
      setCountdown(30);
    } catch (error) {
      setResult('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>XN - Google Sıra Bulucu</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center relative"
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
         XN
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gray-700"></span>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm font-medium uppercase tracking-widest"
            >
              Google Sıra Bulucu
            </motion.p>
            <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gray-700"></span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-8 md:p-10 rounded-2xl backdrop-blur-xl w-full max-w-md border border-gray-800 shadow-2xl"
        >
          <form onSubmit={checkRank} className="space-y-6">
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className={`w-full bg-gradient-to-r ${countdown > 0 ? 'from-gray-500 to-gray-600' : 'from-blue-500 to-blue-600'} text-white font-medium py-3 px-4 rounded-xl transition duration-200 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : countdown > 0 ? (
                `${countdown} saniye bekleyin`
              ) : (
                <>
                  <IoSearchOutline className="text-xl" />
                  Sıra Bul
                </>
              )}
            </motion.button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-700"
            >
              <p className="text-gray-300">{result}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
