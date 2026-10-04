import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, Users, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';

export default function DonorHistory() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rate Modal
  const [ratingReq, setRatingReq] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests?status=COMPLETED');
      if (res.data?.success) {
        setCompletedRequests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingReq) return;

    setSubmittingRating(true);
    try {
      const res = await api.post('/ratings', {
        request_id: ratingReq.id,
        rating: starCount,
        comment
      });
      if (res.data?.success) {
        showToast('Thank you for rating your recipient partner!', 'success');
        setRatingReq(null);
        setComment('');
        fetchHistory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Completed Surplus Distributions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of delivered donations, beneficiary impacts, and recipient feedback
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching distribution history..." />
      ) : completedRequests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No completed distributions yet. Once requests are fulfilled, they will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {completedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">{req.food_name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distributed to <span className="font-semibold text-slate-800">{req.recipient_name}</span> on{' '}
                    {new Date(req.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {req.requested_servings} Servings Nourished
                  </span>
                  <StatusBadge status="COMPLETED" size="sm" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600">
                  <span className="text-slate-400 font-medium">Pickup/Delivery Method:</span>{' '}
                  <span className="font-semibold">{req.delivery_method?.replace(/_/g, ' ') || 'Self Pickup'}</span>
                </div>

                <button
                  onClick={() => setRatingReq(req)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Rate Recipient Organization
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={!!ratingReq}
        onClose={() => setRatingReq(null)}
        title="Rate Recipient Organization"
        subtitle={`Experience with ${ratingReq?.recipient_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRatingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Star Rating (1 to 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setStarCount(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= starCount
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <FormInput
            label="Feedback & Partnership Comments"
            name="comment"
            type="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share feedback on punctuality, hygiene during transit, communication..."
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRatingReq(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRating}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Submit Rating
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
