import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';

export default function DonorRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accept / Schedule Modal state
  const [acceptingReq, setAcceptingReq] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    pickup_date: new Date().toISOString().slice(0, 10),
    pickup_time: '17:00',
    pickup_address: '',
    delivery_method: 'SELF_PICKUP',
    special_instructions: '',
    contact_phone: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  // Reject Modal state
  const [rejectingReq, setRejectingReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      if (res.data?.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openAcceptModal = (req) => {
    setAcceptingReq(req);
    setScheduleData({
      pickup_date: new Date().toISOString().slice(0, 10),
      pickup_time: '17:00',
      pickup_address: req.donation_pickup_address || req.pickup_address || '12 Anna Salai, Chennai',
      delivery_method: 'SELF_PICKUP',
      special_instructions: 'Please bring insulated transport containers and arrive via front gate.',
      contact_phone: req.donor_phone || '+91 9444123456'
    });
  };

  const handleConfirmAccept = async (e) => {
    e.preventDefault();
    if (!acceptingReq) return;

    setSubmittingAction(true);
    try {
      const res = await api.patch(`/requests/${acceptingReq.id}/accept`, scheduleData);
      if (res.data?.success) {
        showToast('Request accepted and pickup scheduled!', 'success');
        setAcceptingReq(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to accept request.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingReq) return;

    setSubmittingAction(true);
    try {
      const res = await api.patch(`/requests/${rejectingReq.id}/reject`, { reason: rejectReason });
      if (res.data?.success) {
        showToast('Request declined.', 'info');
        setRejectingReq(null);
        setRejectReason('');
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to reject request.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await api.patch(`/requests/${requestId}/status`, { status: newStatus });
      if (res.data?.success) {
        showToast(`Transaction updated to: ${newStatus}`, 'success');
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.', 'error');
    }
  };

  const deliveryMethodOptions = [
    { value: 'SELF_PICKUP', label: 'Self Pickup by Recipient Organization' },
    { value: 'DONOR_DELIVERY', label: 'Delivered by Donor Vehicle' },
    { value: 'VOLUNTEER_DELIVERY', label: 'Community Volunteer Transport' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recipient Food Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review community organization requests, accept allocations, and coordinate logistics
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching incoming requests..." />
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No incoming food requests at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{req.recipient_name}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                      {req.recipient_org_type || 'NGO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requested on {new Date(req.requested_at).toLocaleDateString()} at{' '}
                    {new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.match_score && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {req.match_score}% Match
                    </span>
                  )}
                  <StatusBadge status={req.status} size="sm" />
                </div>
              </div>

              {/* Food & Message Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Donation Item</span>
                  <p className="font-bold text-slate-900 text-sm">{req.food_name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Requested: <span className="font-semibold text-emerald-700">{req.requested_servings} Servings</span> (of {req.available_servings} total)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient Message</span>
                  <p className="text-slate-700 italic mt-0.5 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                    "{req.message || 'No additional message.'}"
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient Contact</span>
                  <p className="font-semibold text-slate-900">{req.recipient_phone || 'N/A'}</p>
                  <p className="text-slate-500 text-[11px] truncate">{req.recipient_email}</p>
                </div>
              </div>

              {/* Scheduled Pickup Banner if ACCEPTED / PICKUP_SCHEDULED */}
              {req.pickup_date && (
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-900">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {req.pickup_date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> {req.pickup_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" /> {req.delivery_method?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {req.special_instructions && (
                    <span className="text-slate-600 text-[11px]">
                      Notes: {req.special_instructions}
                    </span>
                  )}
                </div>
              )}

              {/* Actions Row */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setRejectingReq(req)}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => openAcceptModal(req)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept & Schedule Pickup
                    </button>
                  </>
                )}

                {req.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'COLLECTED')}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
                  >
                    Mark as Collected
                  </button>
                )}

                {req.status === 'COLLECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Completed & Delivered
                  </button>
                )}

                {req.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed & Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Pickup Modal */}
      <Modal
        isOpen={!!acceptingReq}
        onClose={() => setAcceptingReq(null)}
        title="Schedule Surplus Food Pickup"
        subtitle={`Fulfilling ${acceptingReq?.requested_servings} servings of ${acceptingReq?.food_name} for ${acceptingReq?.recipient_name}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmAccept} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Pickup Date"
              name="pickup_date"
              type="date"
              value={scheduleData.pickup_date}
              onChange={(e) => setScheduleData({ ...scheduleData, pickup_date: e.target.value })}
              required
            />
            <FormInput
              label="Pickup Time"
              name="pickup_time"
              type="time"
              value={scheduleData.pickup_time}
              onChange={(e) => setScheduleData({ ...scheduleData, pickup_time: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Pickup Address"
            name="pickup_address"
            value={scheduleData.pickup_address}
            onChange={(e) => setScheduleData({ ...scheduleData, pickup_address: e.target.value })}
            placeholder="Address for recipient pickup"
            required
          />

          <FormInput
            label="Delivery / Transport Method"
            name="delivery_method"
            type="select"
            value={scheduleData.delivery_method}
            onChange={(e) => setScheduleData({ ...scheduleData, delivery_method: e.target.value })}
            options={deliveryMethodOptions}
            required
          />

          <FormInput
            label="Contact Phone for Pickup Coordinator"
            name="contact_phone"
            value={scheduleData.contact_phone}
            onChange={(e) => setScheduleData({ ...scheduleData, contact_phone: e.target.value })}
            required
          />

          <FormInput
            label="Special Instructions for Recipient"
            name="special_instructions"
            type="textarea"
            rows={2}
            value={scheduleData.special_instructions}
            onChange={(e) => setScheduleData({ ...scheduleData, special_instructions: e.target.value })}
            placeholder="e.g. Report to service counter, bring food-grade thermal containers."
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAcceptingReq(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {submittingAction && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Confirm & Schedule Pickup
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingReq}
        onClose={() => setRejectingReq(null)}
        title="Decline Food Request"
        subtitle={`Request from ${rejectingReq?.recipient_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a brief reason for declining (e.g. food already allocated to another shelter, logistics unavailable).
          </p>

          <FormInput
            label="Reason for Declining"
            name="reject_reason"
            type="textarea"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Surplus has been allocated or kitchen is closing."
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectingReq(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              Decline Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
