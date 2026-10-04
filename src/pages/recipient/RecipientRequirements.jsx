import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Trash2, Sparkles, Clock, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RecipientRequirements() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requirements?recipient_id=${user.id}`);
      if (res.data?.success) {
        setRequirements(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load requirements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [user.id]);

  const handleCancelReq = async (id) => {
    try {
      const res = await api.delete(`/requirements/${id}`);
      if (res.data?.success) {
        showToast('Requirement cancelled.', 'info');
        setRequirements((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
        );
      }
    } catch (err) {
      showToast('Failed to cancel requirement.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Food Requirements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered beneficiary meal needs matched against active commercial surplus
          </p>
        </div>

        <Link
          to="/recipient/requirements/create"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Post New Need
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching requirements..." />
      ) : requirements.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
          <p className="font-semibold text-slate-700">No active requirements posted yet.</p>
          <p>Post what food your beneficiaries need using natural language.</p>
          <Link
            to="/recipient/requirements/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Create Requirement (NLP)
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                    {req.food_category}
                  </span>
                  <StatusBadge status={req.status} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{req.food_name}</h3>

                {req.source_text && (
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                    "{req.source_text}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Needed</span>
                      <span className="font-bold text-slate-800">{req.required_servings} People</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Needed By</span>
                      <span className="font-bold text-slate-800 truncate">
                        {req.required_before
                          ? new Date(req.required_before).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Today'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Diet: <span className="font-semibold text-slate-700">{req.diet_type}</span></div>
                  <div>Location: <span className="font-semibold text-slate-700">{req.city}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/recipient/matches?requirementId=${req.id}`}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> View Matches
                </Link>

                {req.status === 'OPEN' && (
                  <button
                    onClick={() => handleCancelReq(req.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Cancel requirement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
