import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AlertCircle, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/resident');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch resident dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 mt-1">Here is the status of your recent complaints.</p>
        </div>
        <Link 
          to="/resident/raise-complaint" 
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <PlusCircle size={20} />
          Raise Complaint
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Open Complaints</p>
            <p className="text-2xl font-bold text-slate-800">{data.byStatus.OPEN || 0}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-slate-800">{data.byStatus.IN_PROGRESS || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Resolved</p>
            <p className="text-2xl font-bold text-slate-800">{data.byStatus.RESOLVED || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">My Recent Complaints</h3>
            <Link to="/resident/complaints" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {data.recentComplaints?.map((comp: any) => (
              <div key={comp.id} className="p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-800">{comp.category}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    comp.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    comp.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{comp.description}</p>
                <div className="mt-3 text-xs text-slate-400">
                  {new Date(comp.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {data.recentComplaints?.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                You haven't raised any complaints yet.
              </div>
            )}
          </div>
        </div>

        {/* Notice Board Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Notice Board</h3>
            <Link to="/resident/notices" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {data.recentNotices?.map((notice: any) => (
              <div key={notice.id} className={`p-4 rounded-lg border-l-4 ${
                notice.is_important ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-primary'
              }`}>
                {notice.is_important && (
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 block">Important</span>
                )}
                <h4 className="font-medium text-slate-800 text-sm mb-1">{notice.title}</h4>
                <div className="text-xs text-slate-400 mt-2">
                  {new Date(notice.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {data.recentNotices?.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No notices available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
