import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { id: 'result', label: 'Go to Studio', path: '/result' },
  { id: 'history', label: 'Open History', path: '/history' },
  { id: 'invoices', label: 'Open Invoices', path: '/invoices' },
  { id: 'buy', label: 'Buy Credits', path: '/buy' },
  { id: 'home', label: 'Home', path: '/' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(COMMANDS);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac && e.metaKey && e.key === 'k') || (!isMac && e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === '?' ) setOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(q ? COMMANDS.filter(c => c.label.toLowerCase().includes(q)) : COMMANDS);
  }, [query]);

  const run = (path) => {
    setOpen(false);
    navigate(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command or path..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm outline-none" />
        </div>
        <div className="max-h-64 overflow-auto">
          {filtered.map(cmd => (
            <button key={cmd.id} onClick={() => run(cmd.path)} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{cmd.label}</div>
              <div className="text-xs text-gray-500">{cmd.path}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No commands</div>
          )}
        </div>
      </div>
    </div>
  );
}
