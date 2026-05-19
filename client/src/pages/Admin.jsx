import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, sub, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl p-6 shadow-md border-l-4 ${color} flex flex-col gap-1`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-gray-500 text-sm font-medium">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </motion.div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-md animate-pulse h-32">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="h-8 bg-gray-200 rounded w-1/3" />
  </div>
);

const Admin = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/stats`, { headers: { token } });
        if (data.success) setStats(data.stats);
        else toast.error(data.message || 'Failed to load stats');
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pt-10 px-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-2">🔒</p>
          <p className="font-semibold">Access Denied – Admin only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-16 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📊 Admin Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="border-blue-500" />
        <StatCard label="Active Today" value={stats.activeUsersToday.toLocaleString()} icon="🟢" color="border-green-500" />
        <StatCard label="Total Generations" value={stats.totalGenerations.toLocaleString()} icon="🎨" color="border-purple-500" />
        <StatCard label="Revenue" value={`$${stats.revenueUSD}`} icon="💰" color="border-yellow-500" />
        <StatCard label="Credits Consumed" value={stats.creditsConsumed.toLocaleString()} icon="⚡" color="border-orange-500" />
        <StatCard label="Failed Jobs" value={stats.failedJobs.toLocaleString()} icon="❌" color="border-red-400" />
        <StatCard label="Avg Gen Time" value={`${(stats.avgGenerationTime / 1000).toFixed(1)}s`} icon="⏱️" color="border-indigo-500" />
        <StatCard
          label="Queue Status"
          value={stats.queue.waiting + stats.queue.active}
          sub={`${stats.queue.active} active · ${stats.queue.waiting} waiting`}
          icon="🔄"
          color="border-teal-500"
        />
      </div>

      {/* Daily Generations Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 Daily Generations (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={stats.dailyGenerations} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#genGrad)" strokeWidth={2} name="Generations" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Users Leaderboard */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">🏆 Top Generators</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 font-medium">Rank</th>
                <th className="text-left py-2 font-medium">Name</th>
                <th className="text-left py-2 font-medium">Email</th>
                <th className="text-right py-2 font-medium">Generations</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers.map((u, i) => (
                <tr key={i} className="border-b last:border-none hover:bg-gray-50 transition">
                  <td className="py-3 text-gray-500 font-bold">{i + 1}</td>
                  <td className="py-3 text-gray-800 font-medium">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3 text-right text-blue-600 font-bold">{u.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
