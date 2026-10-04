import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Filter, HeartHandshake, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MatchCard from '../../components/MatchCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';

export default function RecipientMatches() {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get('requirementId');
  const { showToast } = useToast();

  const [matches, setMatches] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(requirementId || '');
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [activeDonation, setActiveDonation] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [requestedServings, setRequestedServings] = useState(35);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Fetch requirements for dropdown
  useEffect(() => {
    async function fetchReqs() {
      try {
        const res = await api.get('/requirements');
        if (res.data?.success) {
          setRequirements(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchReqs();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      let url = '/matches';
      if (selectedReqId) {
        url += `?requirementId=${selectedReqId}`;
      }
      const res = await api.get(url);
      if (res.data?.success) {
        setMatches(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to calculate matches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [selectedReqId]);

  const handleOpenRequest = (donation, score) => {
    setActiveDonation(donation);
    setMatchScore(score);
    setRequestedServings(donation.servings || 10);
    setRequestMessage(
      `We would love to distribute this surplus ${donation.food_name} to our community shelter beneficiaries today.`
    );
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!activeDonation) return;

    setSubmittingRequest(true);
    try {
      const res = await api.post(`/donations/${activeDonation.id}/request`, {
        requested_servings: requestedServings,
        message: requestMessage,
        requirement_id: selectedReqId || null,
        match_score: matchScore
      });

      if (res.data?.success) {
        showToast('Donation request sent! The donor has been notified.', 'success');
        setActiveDonation(null);
        fetchMatches(); // refresh
      } else {
        showToast(res.data?.message || 'Failed to submit request.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit request.', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Explainable 6-Factor Matching Engine
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Intelligent Surplus Matches
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Surplus ranked by Category (25%), Diet (20%), Servings (20%), Time (15%), Location (10%), and Urgency (10%)
          </p>
        </div>

        {/* Filter by Requirement Selector */}
        {requirements.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs text-slate-500 font-medium shrink-0">Matching for:</label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
            >
              <option value="">All Open Needs (Combined)</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.food_name} ({r.required_servings} people)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Matches List */}
      {loading ? (
        <LoadingSpinner message="Calculating real-time explainable matches..." />
      ) : matches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-3">
          <p className="font-semibold text-slate-700">No surplus matches found currently.</p>
          <p>
            Either all donations are allocated or none match your selected dietary parameters.
          </p>
          <Link
            to="/recipient/requirements/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
          >
            Post a New Food Need
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => (
            <MatchCard
              key={`${m.donation.id}-${m.requirement?.id || 'gen'}`}
              match={m}
              onRequest={(don, score) => handleOpenRequest(don, score)}
            />
          ))}
        </div>
      )}

      {/* Request Food Modal */}
      <Modal
        isOpen={!!activeDonation}
        onClose={() => setActiveDonation(null)}
        title="Request Surplus Food Donation"
        subtitle={`Allocating from ${activeDonation?.food_name} (${activeDonation?.servings} servings available)`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs flex items-center justify-between">
            <span className="font-bold text-emerald-950">Matching Score:</span>
            <span className="font-extrabold text-emerald-700 text-sm">{matchScore}% Match</span>
          </div>

          <FormInput
            label="Requested Servings (Number of People)"
            name="requested_servings"
            type="number"
            min="1"
            max={activeDonation?.servings || 100}
            value={requestedServings}
            onChange={(e) => setRequestedServings(parseInt(e.target.value, 10))}
            helperText={`Available batch: up to ${activeDonation?.servings || 0} servings`}
            required
          />

          <FormInput
            label="Message to Food Donor"
            name="message"
            type="textarea"
            rows={3}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Introduce your organization and explain how beneficiaries will receive this food."
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveDonation(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRequest}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {submittingRequest && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
