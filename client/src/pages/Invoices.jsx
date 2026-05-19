import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const TYPE_COLORS = {
  purchase:         'bg-green-100 text-green-700',
  generation:       'bg-blue-100 text-blue-700',
  refund:           'bg-yellow-100 text-yellow-700',
  admin_adjustment: 'bg-purple-100 text-purple-700',
  free_credits:     'bg-teal-100 text-teal-700',
};

const TYPE_LABELS = {
  purchase:         '💳 Purchase',
  generation:       '🎨 Generation',
  refund:           '↩️ Refund',
  admin_adjustment: '🔧 Admin Adjustment',
  free_credits:     '🎁 Free Credits',
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full" /></td>
    ))}
  </tr>
);

const Invoices = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchInvoices = async (page = 1, type = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type !== 'all') params.set('type', type);

      const { data } = await axios.get(
        `${backendUrl}/api/billing/my-invoices?${params.toString()}`,
        { headers: { token } }
      );
      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(1, filter); }, [filter]);

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/billing/customer-portal`, {}, { headers: { token } });
      if (data.success) window.location.href = data.url;
      else toast.error(data.message);
    } catch {
      toast.error('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pt-8 pb-16 px-2"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🧾 Invoice History</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total} total transactions</p>
        </div>
        <button
          onClick={handleCustomerPortal}
          disabled={portalLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {portalLoading ? 'Loading...' : '⚙️ Manage Billing'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', 'purchase', 'generation', 'refund', 'admin_adjustment', 'free_credits'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Description</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold">Credits</th>
                <th className="text-right px-4 py-3 text-gray-500 font-semibold">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : transactions.length === 0
                ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <p className="text-4xl mb-2">📭</p>
                      <p className="font-medium">No transactions found</p>
                    </td>
                  </tr>
                )
                : transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[tx.type]}`}>
                        {TYPE_LABELS[tx.type] || tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{tx.description || '—'}</td>
                    <td className={`px-4 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 font-medium">{tx.balance}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 px-4 py-4 border-t border-gray-100">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchInvoices(pagination.page - 1, filter)}
              className="px-4 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchInvoices(pagination.page + 1, filter)}
              className="px-4 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Invoices;
