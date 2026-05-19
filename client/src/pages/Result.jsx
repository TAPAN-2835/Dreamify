import { useContext, useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { subscribeToJob, unsubscribeFromJob } from '../lib/socket';
import axios from 'axios';

const STAGE_LABELS = {
  queued:     '🕐 Queued...',
  processing: '⚙️ Generating AI Image...',
  uploading:  '☁️ Uploading to Cloud...',
  completed:  '✅ Complete!',
  failed:     '❌ Generation Failed',
};

const randomPrompts = [
  'A futuristic city skyline at sunset with neon lights',
  'A serene lake surrounded by cherry blossom trees',
  'A robot painting a masterpiece in an art gallery',
  'A magical forest with glowing blue mushrooms',
  'A cozy coffee shop in Tokyo during winter',
  'A dragon soaring above ancient mountains at dawn',
  'A cyberpunk street market in a rainy night',
  'An astronaut floating in space near Saturn',
];

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [blurPlaceholder, setBlurPlaceholder] = useState('');
  const [isImageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [usedPrompt, setUsedPrompt] = useState('');
  const [jobStage, setJobStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState('');

  const { generateImage, loadCreditsData, backendUrl, token } = useContext(AppContext);

  // Keyboard shortcut: R = generate another, D = download
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'r' && isImageLoaded) { setImageLoaded(false); setInput(''); setProgress(0); }
      if (e.key === 'd' && isImageLoaded) { window.open(image, '_blank'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isImageLoaded, image]);

  useEffect(() => {
    return () => { unsubscribeFromJob(); };
  }, []);

  const handleGenerate = async (promptText) => {
    if (!promptText?.trim()) return;
    setLoading(true);
    setImageLoaded(false);
    setHasFailed(false);
    setFailedMessage('');
    setJobStage('queued');
    setProgress(0);
    setUsedPrompt(promptText);
    setBlurPlaceholder('');

    const jobId = await generateImage(promptText);
    if (!jobId) { setLoading(false); setJobStage(''); return; }

    setCurrentJobId(jobId);

    subscribeToJob(jobId, (payload) => {
      const { status, progress: prog, resultUrl, blurPlaceholder: lqip, errorMessage } = payload;
      setProgress(prog || 0);

      if (status === 'queued') { setJobStage('queued'); }
      else if (status === 'processing') { setJobStage(prog >= 55 ? 'uploading' : 'processing'); }
      else if (status === 'completed') {
        unsubscribeFromJob();
        if (lqip) setBlurPlaceholder(lqip);
        setJobStage('completed');
        setProgress(100);
        setImage(resultUrl);
        setImageLoaded(true);
        setLoading(false);
        setCurrentJobId(null);
        loadCreditsData();
        toast.success('Image generated!');
      } else if (status === 'failed') {
        unsubscribeFromJob();
        setJobStage('failed');
        setHasFailed(true);
        setFailedMessage(errorMessage || 'Generation failed');
        setLoading(false);
        setCurrentJobId(null);
        toast.error(errorMessage || 'Generation failed. Please try again.');
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    await handleGenerate(input);
  };

  const handleCancel = async () => {
    if (!currentJobId) return;
    try {
      await axios.delete(`${backendUrl}/api/image/job/${currentJobId}`, { headers: { token } });
      unsubscribeFromJob();
      setLoading(false);
      setJobStage('');
      setCurrentJobId(null);
      toast.info('Generation cancelled');
    } catch { toast.error('Could not cancel job'); }
  };

  const handleCopyPrompt = () => { navigator.clipboard.writeText(usedPrompt || input); toast.info('Prompt copied!'); };
  const handleRandomPrompt = () => setInput(randomPrompts[Math.floor(Math.random() * randomPrompts.length)]);
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: 'My Dreamify AI Image', url: image });
    else { navigator.clipboard.writeText(image); toast.info('Image URL copied!'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="flex flex-col min-h-[90vh] justify-center items-center py-10"
    >
      <div className="w-full max-w-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 tracking-tight">✨ AI Image Studio</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Shortcuts: <kbd className="bg-gray-100 px-1 rounded">R</kbd> new · <kbd className="bg-gray-100 px-1 rounded">D</kbd> download</p>

        {/* Image Preview */}
        <div className="relative w-full mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" style={{ minHeight: 280 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ backgroundImage: blurPlaceholder ? `url(${blurPlaceholder})` : undefined, backgroundSize: 'cover' }}
              >
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm" />
                <div className="relative z-10 flex flex-col items-center gap-3 w-full px-8">
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent" />
                  <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">{STAGE_LABELS[jobStage] || 'Starting...'}</p>
                  <div className="w-full bg-gray-300/60 rounded-full h-2">
                    <motion.div className="bg-blue-500 h-2 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{progress}% complete</p>
                  <button onClick={handleCancel}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 border border-red-300 px-4 py-1.5 rounded-lg transition hover:bg-red-50"
                  >✕ Cancel</button>
                </div>
              </motion.div>
            ) : hasFailed ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-4xl">😵</p>
                <p className="text-red-600 font-semibold text-center">{failedMessage}</p>
                <button onClick={() => { setHasFailed(false); handleGenerate(usedPrompt); }}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-xl transition">
                  🔄 Retry
                </button>
                <button onClick={() => { setHasFailed(false); }} className="text-xs text-gray-400 hover:underline">Dismiss</button>
              </motion.div>
            ) : (
              <motion.img key="image" src={image} alt="Generated" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                className="w-full object-contain rounded-2xl" style={{ maxHeight: 400 }} loading="lazy"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Prompt Input */}
        {!isImageLoaded && !hasFailed && (
          <form onSubmit={onSubmitHandler} className="w-full flex flex-col gap-3">
            <div className="relative">
              <input value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} type="text"
                placeholder="Describe what you want to create..."
                className="w-full bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-gray-900 text-sm px-5 py-3.5 pr-12 rounded-2xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 transition"
              />
              <button type="button" onClick={handleRandomPrompt} disabled={loading} title="Random prompt"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition disabled:opacity-30">🎲</button>
            </div>
            <button type="submit" disabled={loading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-sm font-semibold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              {loading ? (STAGE_LABELS[jobStage] || 'Processing...') : '✨ Generate Image'}
            </button>
            <button type="button" onClick={handleCopyPrompt} className="text-xs text-gray-400 hover:text-blue-500 transition self-end">Copy Prompt</button>
          </form>
        )}

        {/* Post-generation */}
        {isImageLoaded && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center gap-4 mt-2">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2 text-sm text-gray-600 dark:text-gray-300 text-center max-w-full truncate border border-gray-100 dark:border-gray-600">
              "{usedPrompt}"
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={() => { setImageLoaded(false); setInput(''); setProgress(0); setBlurPlaceholder(''); }}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium transition">
                New Image <span className="text-xs text-gray-400 ml-1">[R]</span>
              </button>
              <a href={image} target="_blank" rel="noreferrer"
                className="bg-gray-800 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                Download <span className="text-xs text-gray-400 ml-1">[D]</span>
              </a>
              <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">Share</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Result;