import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Filter, Search, AlertTriangle } from 'lucide-react';

interface Props {
  role: 'ADMIN' | 'RESIDENT';
}

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Cleaning', 'Security', 
  'Lift/Elevator', 'Water Supply', 'Parking', 'Maintenance', 'Other'
];

const ComplaintsList: React.FC<Props> = ({ role }) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  const fetchComplaints = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      if (priority) params.append('priority', priority);
      if (overdue) params.append('overdue', 'true');
      if (sortBy) params.append('sortBy', sortBy);
      
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      
      const res = await api.get(`/complaints?${params.toString()}`);
      const newData = res.data.data;
      
      if (isLoadMore) {
        setComplaints(prev => [...prev, ...newData]);
      } else {
        setComplaints(newData);
      }
      
      setHasMore(newData.length === LIMIT);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchComplaints(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, priority, overdue, sortBy]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchComplaints(false);
    }, 500);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (page > 1) {
      fetchComplaints(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
              {role === 'ADMIN' ? 'All Complaints' : 'My Complaints'}
            </h2>
            {role === 'RESIDENT' && (
              <Link 
                to="/resident/raise-complaint" 
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Raise New
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={role === 'ADMIN' ? "Search ID, Name, Email..." : "Search ID..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={overdue}
                onChange={(e) => setOverdue(e.target.checked)}
                className="rounded text-red-500 focus:ring-red-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <AlertTriangle size={16} className={overdue ? "text-red-500" : "text-slate-400"} />
                Show Overdue Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              {role === 'ADMIN' && <th className="px-6 py-4">Resident</th>}
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Priority & Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && page === 1 ? (
              <tr>
                <td colSpan={role === 'ADMIN' ? 6 : 5} className="px-6 py-8 text-center text-slate-500">
                  Loading complaints...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={role === 'ADMIN' ? 6 : 5} className="px-6 py-8 text-center text-slate-500">
                  No complaints found matching criteria.
                </td>
              </tr>
            ) : (
              complaints.map((comp) => (
                <tr key={comp.id} className={`hover:bg-slate-50 transition-colors ${comp.is_overdue || comp.priority === 'HIGH' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {comp.id}
                  </td>
                  {role === 'ADMIN' && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-medium">{comp.resident?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{comp.resident?.email}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800 mb-1">{comp.category}</div>
                    <div className="text-sm text-slate-500 max-w-xs truncate" title={comp.description}>
                      {comp.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        comp.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                        comp.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {comp.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                        comp.status === 'RESOLVED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        comp.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-white text-slate-800 border border-slate-300'
                      }`}>
                        {comp.status}
                      </span>
                      {comp.is_overdue === 1 && comp.status !== 'RESOLVED' && (
                        <span className="px-2 py-1 text-xs rounded-full font-bold bg-red-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={12} /> OVERDUE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(comp.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link 
                      to={`/${role.toLowerCase()}/complaints/${comp.id}`} 
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {!loading && hasMore && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
          <button 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            Load More Complaints
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;
