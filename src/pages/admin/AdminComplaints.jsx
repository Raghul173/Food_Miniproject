import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';

export default function AdminComplaints() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit/Resolve Modal
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [statusVal, setStatusVal] = useState('RESOLVED');
  const [notesVal, setNotesVal] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolutionModal = (c) => {
    setActiveComplaint(c);
    setStatusVal(c.status === 'PENDING' ? 'RESOLVED' : c.status);
    setNotesVal(c.resolution_notes || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/admin/complaints/${activeComplaint.id}`, {
        status: statusVal,
        resolution_notes: notesVal
      });

      if (res.data?.success) {
        showToast('Complaint status and resolution notes updated.', 'success');
        setActiveComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      showToast('Failed to update complaint.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'IN_PROGRESS', label: 'In Progress (Investigating)' },
    { value: 'RESOLVED', label: 'Resolved (Action Completed)' },
    { value: 'DISMISSED', label: 'Dismissed (Invalid / Solved)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Issue & Complaint Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review reported concerns regarding food handling, transit coordination, or platform usage
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching reported complaints..." />
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No complaints reported in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">{c.subject}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reported by <span className="font-semibold text-slate-800">{c.complainant_name}</span> ({c.complainant_role}) • {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} size="sm" />
                  <button
                    onClick={() => openResolutionModal(c)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">Description:</span>
                {c.description}
              </div>

              {c.food_name && (
                <div className="text-[11px] text-slate-500">
                  Referenced Surplus Item: <span className="font-semibold text-slate-700">{c.food_name}</span>
                </div>
              )}

              {c.resolution_notes && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-950">
                  <span className="font-bold block mb-0.5">Resolution Notes:</span>
                  {c.resolution_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!activeComplaint}
        onClose={() => setActiveComplaint(null)}
        title="Resolve / Update Complaint"
        subtitle={`Case ID #${activeComplaint?.id}: ${activeComplaint?.subject}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveResolution} className="space-y-4">
          <FormInput
            label="Resolution Status"
            name="status"
            type="select"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
            options={statusOptions}
            required
          />

          <FormInput
            label="Official Resolution Notes"
            name="resolution_notes"
            type="textarea"
            rows={4}
            value={notesVal}
            onChange={(e) => setNotesVal(e.target.value)}
            placeholder="Document administrative findings, actions taken, or donor/recipient advisories..."
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveComplaint(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
