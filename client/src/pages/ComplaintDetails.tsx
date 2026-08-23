import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, User, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface Props {
  role: 'ADMIN' | 'RESIDENT';
}

const ComplaintDetails: React.FC<Props> = ({ role }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.data);
      setNewStatus(res.data.data.status);
    } catch (error) {
      console.error('Failed to fetch complaint details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === complaint.status) return;
    
    setUpdateLoading(true);
    try {
      await api.put(`/complaints/${id}/status`, {
        status: newStatus,
        note: adminNote
      });
      setAdminNote('');
      fetchComplaint();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    try {
      await api.put(`/complaints/${id}/priority`, { priority });
      fetchComplaint();
    } catch (error) {
      console.error('Failed to update priority', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading details...</div>;
  if (!complaint) return <div className="text-center py-10 text-red-500">Complaint not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to List</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800">{complaint.category}</h2>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                    complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    complaint.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {complaint.status}
                  </span>
                  {complaint.is_overdue && (
                    <span className="px-2.5 py-1 text-xs rounded-full font-bold bg-red-500 text-white uppercase tracking-wider">
                      OVERDUE
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-slate-400">ID: {complaint.id}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">Description</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap border border-slate-100">
                {complaint.description}
              </div>
            </div>

            {complaint.photo_url && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <ImageIcon size={16} /> Attached Photo
                </h3>
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img 
                    src={import.meta.env.VITE_API_URL?.replace('/api', '') + complaint.photo_url} 
                    alt="Complaint attachment" 
                    className="w-full max-h-[400px] object-contain bg-slate-100"
                    onError={(e) => {
                      // Fallback for demo when backend is down
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Photo+Not+Available';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Complaint Timeline</h3>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
              {complaint.history.map((record: any, index: number) => (
                <div key={record.id} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                    record.new_status === 'RESOLVED' ? 'bg-green-500' :
                    record.new_status === 'IN_PROGRESS' ? 'bg-blue-500' :
                    'bg-slate-400'
                  }`}></div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {record.old_status && <span className="text-slate-400 line-through text-sm">{record.old_status}</span>}
                        {record.old_status && <span className="text-slate-300">→</span>}
                        <span className={`
                          ${record.new_status === 'RESOLVED' ? 'text-green-600' : 
                            record.new_status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-slate-700'}
                        `}>
                          {record.new_status}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-xs text-slate-500 font-medium gap-1">
                          <User size={12} />
                          {record.actor_name || 'System'}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 gap-1 mt-1">
                          <Clock size={12} />
                          {new Date(record.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {record.note && (
                      <p className="text-sm text-slate-600 mt-3 bg-white p-3 rounded border border-slate-100 italic">
                        "{record.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Resident</p>
                <div className="flex items-center gap-2 text-slate-800">
                  <User size={16} className="text-slate-400" />
                  <span className="font-medium">{complaint.resident.name}</span>
                </div>
                <p className="text-sm text-slate-500 ml-6">{complaint.resident.email}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Created At</p>
                <p className="text-sm text-slate-800 font-medium">
                  {new Date(complaint.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Priority</p>
                {role === 'ADMIN' ? (
                  <select 
                    value={complaint.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md font-medium
                      ${complaint.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                        complaint.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'}
                    `}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                ) : (
                  <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-bold ${
                    complaint.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {complaint.priority}
                  </span>
                )}
              </div>
            </div>
          </div>

          {role === 'ADMIN' && complaint.status !== 'RESOLVED' && (
            <div className="bg-white rounded-xl shadow-sm border border-primary p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-primary" />
                Update Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter update note..."
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updateLoading || newStatus === complaint.status}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                >
                  {updateLoading ? 'Updating...' : 'Save Update'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
