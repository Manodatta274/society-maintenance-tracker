import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, CheckCircle, Clock, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setStats(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-10 text-red-500">Failed to load data</div>;

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];
  
  const statusData = [
    { name: 'Open', value: stats.byStatus?.OPEN || 0 },
    { name: 'In Progress', value: stats.byStatus?.IN_PROGRESS || 0 },
    { name: 'Resolved', value: stats.byStatus?.RESOLVED || 0 },
  ];

  const categoryData = Object.keys(stats.byCategory || {}).map(key => ({
    name: key,
    value: stats.byCategory[key]
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Complaints</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Resolution Rate</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {stats.resolutionRate !== undefined ? `${Math.round(parseFloat(stats.resolutionRate))}%` : '0%'}
            </h3>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Resolution</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {stats.avgResolutionHours && parseFloat(stats.avgResolutionHours) > 0 
                ? `${stats.avgResolutionHours} hrs` 
                : 'N/A'}
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div>
            <p className="text-sm font-medium text-red-600">Overdue SLA</p>
            <h3 className="text-2xl font-bold text-red-700 mt-1">{stats.overdue}</h3>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Complaints by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Complaints by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log / Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[380px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Activity size={18} className="text-slate-600" />
            <h3 className="text-md font-bold text-slate-800">Recent Activity</h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((log: any) => (
                <div key={log.id} className="border-l-2 border-primary pl-3 py-1">
                  <p className="text-sm font-medium text-slate-800">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">{log.actor_name}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
