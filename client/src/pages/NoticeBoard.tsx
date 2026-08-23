import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface Props {
  role: 'ADMIN' | 'RESIDENT';
}

const NoticeBoard: React.FC<Props> = ({ role }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.data);
    } catch (error) {
      console.error('Failed to fetch notices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, { title, content, is_important: isImportant });
      } else {
        await api.post('/notices', { title, content, is_important: isImportant });
      }
      setIsModalOpen(false);
      resetForm();
      fetchNotices();
    } catch (error) {
      console.error('Failed to save notice', error);
      alert('Failed to save notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      console.error('Failed to delete notice', error);
    }
  };

  const openEdit = (notice: any) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setIsImportant(notice.is_important);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notice Board</h2>
          <p className="text-slate-500 mt-1">Important updates and announcements</p>
        </div>
        {role === 'ADMIN' && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Post Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100">
            No notices posted yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${
              notice.is_important ? 'border-orange-300' : 'border-slate-100'
            }`}>
              {notice.is_important && (
                <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" />
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Important</span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{notice.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap flex-1">
                  {notice.content}
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                  <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  
                  {role === 'ADMIN' && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(notice)} className="text-slate-400 hover:text-blue-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(notice.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Notice' : 'Post New Notice'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="isImportant" className="text-sm text-slate-700">
                  Mark as Important (Pins to top and emails residents)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  {editingId ? 'Update Notice' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
