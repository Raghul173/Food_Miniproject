import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Heart, Utensils } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import Card from '../../components/Card';

export default function CreateRequirement() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nlpText, setNlpText] = useState(
    'We need vegetarian cooked food for around 35 people before 7 PM.'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const [formData, setFormData] = useState({
    food_category: 'Cooked Food',
    food_name: 'Vegetarian Cooked Food',
    required_servings: 35,
    diet_type: 'VEGETARIAN',
    required_before: '',
    urgency: 'HIGH',
    city: 'Chennai',
    pincode: '600008'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyzeNLP = async () => {
    if (!nlpText.trim()) {
      showToast('Please enter a natural language requirement.', 'warning');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');

    try {
      const res = await api.post('/nlp/analyze-requirement', { text: nlpText });
      if (res.data?.success) {
        const ext = res.data.data;
        setExtractedData(ext);

        const todayStr = new Date().toISOString().slice(0, 10);
        let reqBeforeDatetime = '';

        if (ext.requiredBefore && ext.requiredBefore !== 'UNKNOWN') {
          reqBeforeDatetime = `${todayStr}T${ext.requiredBefore}`;
        } else {
          // default 4 hours from now
          const future = new Date(Date.now() + 4 * 3600 * 1000);
          reqBeforeDatetime = future.toISOString().slice(0, 16);
        }

        setFormData((prev) => ({
          ...prev,
          food_category: ext.foodCategory !== 'UNKNOWN' ? ext.foodCategory : 'Cooked Food',
          food_name: ext.foodName !== 'UNKNOWN' ? ext.foodName : 'Meals',
          required_servings: ext.requiredServings || 35,
          diet_type: ext.dietType !== 'UNKNOWN' ? ext.dietType : 'VEGETARIAN',
          required_before: reqBeforeDatetime,
          urgency: ext.urgency !== 'UNKNOWN' ? ext.urgency : 'HIGH',
          city: ext.location !== 'UNKNOWN' ? ext.location : prev.city || 'Chennai'
        }));

        showToast('Local NLP extracted requirement metadata! Review and confirm below.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('NLP analysis failed. Please specify requirement values manually.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.required_servings <= 0) {
      setErrorMsg('Required servings must be at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        source_text: nlpText
      };

      const res = await api.post('/requirements', payload);
      if (res.data?.success) {
        showToast('Food requirement registered! Finding surplus matches...', 'success');
        navigate(`/recipient/matches?requirementId=${res.data.data.id}`);
      } else {
        setErrorMsg(res.data?.message || 'Failed to post requirement.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error creating requirement.');
      showToast('Error registering requirement.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const foodCategoryOptions = [
    { value: 'Cooked Food', label: 'Cooked Food (Hot Meals, Rice, Curries)' },
    { value: 'Bakery', label: 'Bakery (Bread, Buns, Snacks)' },
    { value: 'Fruits', label: 'Fresh Seasonal Fruits' },
    { value: 'Vegetables', label: 'Fresh Vegetables' },
    { value: 'Packaged Food', label: 'Packaged / Dry Rations' },
    { value: 'Beverages', label: 'Beverages & Dairy' },
    { value: 'Groceries', label: 'Raw Groceries' },
    { value: 'Other', label: 'Other' }
  ];

  const dietOptions = [
    { value: 'VEGETARIAN', label: 'Vegetarian' },
    { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'EGGETARIAN', label: 'Eggetarian' },
    { value: 'UNKNOWN', label: 'Any / Unspecified' }
  ];

  const urgencyOptions = [
    { value: 'HIGH', label: 'Urgent (Required within hours)' },
    { value: 'MEDIUM', label: 'Standard (Required today)' },
    { value: 'LOW', label: 'Flexible (Can accept over next days)' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md">
          Recipient NLP Analysis
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Post Food Requirement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          State your beneficiary group's food requirements in natural text. Our local NLP engine extracts the parameters to match with donor surplus.
        </p>
      </div>

      {/* NLP Requirement Entry */}
      <Card
        title="Enter Food Need in Natural Language"
        subtitle="100% Local Rule-Based NLP extraction without external AI APIs"
        className="border-amber-200/90 shadow-sm"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder="e.g. We need vegetarian cooked food for around 35 people before 7 PM."
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setNlpText('We need vegetarian cooked food for around 35 people before 7 PM.')
                }
                className="text-amber-700 hover:underline bg-amber-50 px-2 py-0.5 rounded-md font-medium"
              >
                Hope Center Need (Cooked)
              </button>
              <button
                type="button"
                onClick={() =>
                  setNlpText('Need nutritious bakery items or wholesome evening snack for 40 orphan children before 6 PM.')
                }
                className="text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded-md font-medium"
              >
                Orphanage Snacks
              </button>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeNLP}
              disabled={analyzing}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 self-end sm:self-auto"
            >
              {analyzing ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Analyze Requirement (NLP)
            </button>
          </div>

          {/* Extracted payload summary */}
          {extractedData && (
            <div className="mt-4 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>NLP Parsed Parameters:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 font-medium">Category:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.foodCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Diet Type:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.dietType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Servings:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.requiredServings} people</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Needed By:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.requiredBefore}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Urgency:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.urgency}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation & Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          title="Review & Register Requirement"
          subtitle="All values can be adjusted before querying donor inventory"
        >
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Food Category"
                name="food_category"
                type="select"
                value={formData.food_category}
                onChange={handleInputChange}
                options={foodCategoryOptions}
                required
              />

              <FormInput
                label="Food Description / Name"
                name="food_name"
                value={formData.food_name}
                onChange={handleInputChange}
                placeholder="e.g. Cooked Vegetarian Meals"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Required Servings (People)"
                name="required_servings"
                type="number"
                min="1"
                value={formData.required_servings}
                onChange={handleInputChange}
                required
              />

              <FormInput
                label="Diet Compatibility"
                name="diet_type"
                type="select"
                value={formData.diet_type}
                onChange={handleInputChange}
                options={dietOptions}
                required
              />

              <FormInput
                label="Urgency"
                name="urgency"
                type="select"
                value={formData.urgency}
                onChange={handleInputChange}
                options={urgencyOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Required Before (Deadline)"
                name="required_before"
                type="datetime-local"
                value={formData.required_before}
                onChange={handleInputChange}
              />

              <FormInput
                label="City / Area"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />

              <FormInput
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/recipient/dashboard')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Find Intelligent Matches
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
