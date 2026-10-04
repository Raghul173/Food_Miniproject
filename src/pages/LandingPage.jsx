import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  Clock,
  Heart,
  CheckCircle2,
  Cpu,
  MapPin,
  ChevronRight,
  Award
} from 'lucide-react';
import api from '../services/api';
import DonationCard from '../components/DonationCard';
import Modal from '../components/Modal';

export default function LandingPage() {
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // NLP Interactive Simulator state
  const [simText, setSimText] = useState(
    'We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM.'
  );
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    async function fetchPublicDonations() {
      try {
        const res = await api.get('/donations?status=AVAILABLE&limit=3');
        if (res.data?.success) {
          setRecentDonations(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load donations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicDonations();
  }, []);

  const handleSimulateNLP = async () => {
    setSimLoading(true);
    try {
      const res = await api.post('/nlp/analyze-donation', { text: simText });
      if (res.data?.success) {
        setSimResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-hero border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            100% Local NLP & Explainable Matching • Zero External AI Fees
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Rescue Food. Reduce Waste.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Serve Communities.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A transparent platform bridging commercial surplus food with orphanages, shelters, and community kitchens in real time using local NLP information extraction and 6-factor explainable matching.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register?role=DONOR"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Join as Food Donor <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register?role=RECIPIENT"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Join as Recipient NGO <Heart className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-xs transition-colors"
            >
              Sign In (Demo Logins)
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-md">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">2,450+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Meals Rescued</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-500">100%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Local Rule AI</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">6-Factor</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Matching Engine</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">0 API Costs</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Zero Paid APIs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive NLP Demo Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Cpu className="w-3.5 h-3.5" /> Interactive Demonstration
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Experience Local Natural Language Extraction
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Test the built-in rule-based NLP engine. It parses natural sentences into clean, validated schema fields without sending data to external APIs.
              </p>
            </div>

            <button
              onClick={handleSimulateNLP}
              disabled={simLoading}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
            >
              {simLoading ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze with Local NLP
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Natural Language Input
              </label>
              <textarea
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                rows={4}
                className="w-full rounded-2xl bg-slate-800/90 border border-slate-700 p-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed font-mono"
                placeholder="Enter description like: We have 40 packets of vegetarian biryani prepared at 2 PM..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setSimText('We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM.')
                  }
                  className="text-[11px] text-emerald-400 hover:underline bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  Load Scenario 1 (Donor)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSimText('25 loaves of fresh whole wheat bread and dinner buns prepared at 10 AM. Can serve 50 kids before tomorrow 6 PM.')
                  }
                  className="text-[11px] text-amber-400 hover:underline bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                >
                  Load Scenario 2 (Bakery)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Extracted Structured Payload
              </label>
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-emerald-300 min-h-[140px] overflow-x-auto">
                {simResult ? (
                  <pre>{JSON.stringify(simResult, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic py-8">
                    Click "Analyze with Local NLP" above to see real-time parsing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How The End-to-End Workflow Works
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            A frictionless journey from kitchen surplus to community impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4 text-base border border-emerald-100">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Natural Language Entry</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Donors type in natural language what food they have. The local NLP parser automatically identifies food item, quantity, diet type, servings, and consumption deadlines.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center mb-4 text-base border border-amber-100">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Transparent Explainable AI</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Our 6-factor weighted algorithm evaluates Category (25%), Diet (20%), Servings (20%), Time (15%), Location (10%), and Urgency (10%) with Haversine distance.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center mb-4 text-base border border-teal-100">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Scheduled Pickup & Verification</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Donors accept requests, schedule pickup timing and logistics method. After delivery, both parties exchange verified ratings and reviews.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Live Available Food Surplus Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
              Live Available Surplus
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Recently Published Food Donations
            </h2>
          </div>

          <Link
            to="/login"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Log in to Request Food <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading surplus donations...</div>
        ) : recentDonations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No active surplus donations at this exact moment. Donors can publish new meals anytime!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                showActions={true}
                isRecipient={false}
                onViewDetails={(d) => setSelectedDonation(d)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Food Safety Commitment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Food Safety & Distribution Protocol
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Safe Handling & Strict Verification</h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Every donor profile records FSSAI license numbers and preparation timestamps. Automated countdown indicators warn handlers when consumption deadlines approach to ensure safe distribution.
            </p>
          </div>

          <Link
            to="/register"
            className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm shadow-md transition-colors shrink-0"
          >
            Register Your Organization
          </Link>
        </div>
      </section>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <Modal
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          title={selectedDonation.food_name}
          subtitle={`${selectedDonation.food_category} • ${selectedDonation.city}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">{selectedDonation.description}</p>
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Servings</p>
                <p className="font-bold text-slate-900">{selectedDonation.servings} people ({selectedDonation.quantity} {selectedDonation.unit})</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Consume Before</p>
                <p className="font-bold text-slate-900">{new Date(selectedDonation.consume_before).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Storage</p>
                <p className="font-bold text-slate-900">{selectedDonation.storage_condition}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Allergens</p>
                <p className="font-bold text-slate-900">{selectedDonation.allergens || 'None'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 font-bold uppercase">Pickup Address</p>
              <p className="font-semibold text-slate-800">{selectedDonation.pickup_address}, {selectedDonation.city}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
