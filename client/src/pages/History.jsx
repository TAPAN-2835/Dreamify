import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const fetchHistory = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/image/history?page=${pageNum}&limit=12`,
        { headers: { token } }
      );
      if (data.success) {
        setHistory(prev => reset ? data.history : [...prev, ...data.history]);
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch { toast.error('Failed to fetch history'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [backendUrl, token]);

  useEffect(() => { if (token) fetchHistory(1, true); }, [token]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchHistory(page + 1);
      }
    }, { threshold: 0.5 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/image/history/${id}`, { headers: { token } });
      toast.success('Deleted');
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied! Paste in studio to regenerate.');
    navigate('/result');
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse border border-gray-100 dark:border-gray-700">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pt-8 pb-16 px-2"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">🎨 Generation History</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All your AI-generated images</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-6xl mb-4">🖼️</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No generations yet</h3>
          <p className="text-gray-400 mb-6">Start creating amazing AI images</p>
          <button onClick={() => navigate('/result')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
            Create your first image →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {history.map((item) => (
              <motion.div key={item._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                {/* Image with blur placeholder */}
                <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {item.blurPlaceholder && (
                    <img src={item.blurPlaceholder} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm" aria-hidden />
                  )}
                  <img
                    src={item.thumbnailUrl || item.imageUrl}
                    alt={item.prompt}
                    className="relative w-full h-full object-cover transition-opacity duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2 font-medium">{item.prompt}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 mt-auto">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                    <a href={item.imageUrl} target="_blank" rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-xs font-semibold">View Full</a>
                    <button onClick={() => handleCopyPrompt(item.prompt)}
                      className="text-green-500 hover:text-green-700 text-xs font-semibold">Retry</button>
                    <button onClick={() => handleDelete(item._id)}
                      className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="flex justify-center mt-8">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                Loading more...
              </div>
            )}
            {!hasMore && history.length > 0 && (
              <p className="text-gray-400 text-sm">✓ All {history.length} images loaded</p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default History;
