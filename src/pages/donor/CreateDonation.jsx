import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Utensils,
  RefreshCw,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import Card from '../../components/Card';

export default function CreateDonation() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Natural Language Input
  const [nlpText, setNlpText] = useState(
    'We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM.'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  // Form Fields (editable by user)
  const [formData, setFormData] = useState({
    food_name: '',
    food_category: 'Cooked Food',
    description: '',
    quantity: 1,
    unit: 'packets',
    servings: 1,
    diet_type: 'VEGETARIAN',
    prepared_at: '',
    consume_before: '',
    storage_condition: 'ROOM_TEMPERATURE',
    packaging_condition: 'Standard food containers',
    allergens: 'None',
    pickup_address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    urgency: 'HIGH'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. NLP Analysis Action
  const handleAnalyzeNLP = async () => {
    if (!nlpText.trim()) {
      showToast('Please enter a natural language description.', 'warning');
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');

    try {
      const res = await api.post('/nlp/analyze-donation', { text: nlpText });
      if (res.data?.success) {
        const ext = res.data.data;
        setExtractedData(ext);

        // Convert preparedAt and consumeBefore (HH:MM) to today's datetime-local strings
        const todayStr = new Date().toISOString().slice(0, 10);
        let prepDatetime = '';
        let consumeDatetime = '';

        if (ext.preparedAt && ext.preparedAt !== 'UNKNOWN') {
          prepDatetime = `${todayStr}T${ext.preparedAt}`;
        }
        if (ext.consumeBefore && ext.consumeBefore !== 'UNKNOWN') {
          consumeDatetime = `${todayStr}T${ext.consumeBefore}`;
        } else {
          // default 6 hours from now
          const future = new Date(Date.now() + 6 * 3600 * 1000);
          consumeDatetime = future.toISOString().slice(0, 16);
        }

        // Fill form with extracted information (allowing user to edit)
        setFormData((prev) => ({
          ...prev,
          food_name: ext.foodName !== 'UNKNOWN' ? ext.foodName : prev.food_name || 'Food Surplus',
          food_category: ext.foodCategory !== 'UNKNOWN' ? ext.foodCategory : 'Cooked Food',
          quantity: ext.quantity || 1,
          unit: ext.unit || 'packets',
          servings: ext.servings || 1,
          diet_type: ext.dietType !== 'UNKNOWN' ? ext.dietType : 'VEGETARIAN',
          prepared_at: prepDatetime,
          consume_before: consumeDatetime,
          storage_condition: ext.storageCondition !== 'UNKNOWN' ? ext.storageCondition : 'ROOM_TEMPERATURE',
          allergens: ext.allergens !== 'UNKNOWN' ? ext.allergens : 'None',
          urgency: ext.urgency !== 'UNKNOWN' ? ext.urgency : 'HIGH',
          city: ext.location !== 'UNKNOWN' ? ext.location : prev.city || 'Chennai'
        }));

        showToast('Local NLP extracted food metadata! Please review and confirm below.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('NLP analysis failed. You can still fill the form manually.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Publish Food Donation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.food_name) {
      setErrorMsg('Food name is required.');
      return;
    }
    if (!formData.consume_before) {
      setErrorMsg('Consumption deadline is required.');
      return;
    }

    if (formData.prepared_at && new Date(formData.consume_before) <= new Date(formData.prepared_at)) {
      setErrorMsg('Consume before deadline must be later than preparation time.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        nlp_source_text: nlpText
      };

      const res = await api.post('/donations', payload);
      if (res.data?.success) {
        showToast('Food donation published successfully! Now matching with recipients.', 'success');
        navigate('/donor/donations');
      } else {
        setErrorMsg(res.data?.message || 'Failed to publish donation.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error publishing donation.');
      showToast(err.response?.data?.message || 'Error publishing donation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const foodCategoryOptions = [
    { value: 'Cooked Food', label: 'Cooked Food (Rice, Biryani, Curries, Meals)' },
    { value: 'Packaged Food', label: 'Packaged Food (Canned, Biscuits, Sealed)' },
    { value: 'Bakery', label: 'Bakery (Bread, Buns, Pastries)' },
    { value: 'Fruits', label: 'Fresh Fruits' },
    { value: 'Vegetables', label: 'Fresh Vegetables' },
    { value: 'Beverages', label: 'Beverages (Juice, Milk)' },
    { value: 'Groceries', label: 'Groceries / Raw Rations' },
    { value: 'Other', label: 'Other' }
  ];

  const dietOptions = [
    { value: 'VEGETARIAN', label: 'Vegetarian' },
    { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'EGGETARIAN', label: 'Eggetarian' },
    { value: 'UNKNOWN', label: 'Unspecified / Unknown' }
  ];

  const storageOptions = [
    { value: 'ROOM_TEMPERATURE', label: 'Room Temperature (Standard)' },
    { value: 'REFRIGERATED', label: 'Refrigerated / Chilled' },
    { value: 'FROZEN', label: 'Deep Frozen' },
    { value: 'WARM', label: 'Warm / Insulated Catering Pan' }
  ];

  const urgencyOptions = [
    { value: 'HIGH', label: 'High (Distribute within 4-6 hours)' },
    { value: 'MEDIUM', label: 'Medium (Distribute within 12-24 hours)' },
    { value: 'LOW', label: 'Low (Packaged / Shelf-stable)' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
          Step 1: NLP Text Extraction
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Publish Food Donation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Type naturally about what food you have prepared. The local NLP parser will extract structured values for you to review and customize.
        </p>
      </div>

      {/* NLP Entry Box */}
      <Card
        title="Enter Food Surplus in Natural Language"
        subtitle="100% Local Rule-Based NLP extraction without external AI APIs"
        className="border-emerald-200/90 shadow-sm"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={nlpText}
            onChange={(e) => setNlpText(e.target.value)}
            placeholder="e.g. We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM."
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-sans leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setNlpText(
                    'We have 40 packets of vegetarian biryani prepared at 2 PM. It can serve 40 people and should be consumed before 8 PM.'
                  )
                }
                className="text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded-md font-medium"
              >
                Biryani Packets
              </button>
              <button
                type="button"
                onClick={() =>
                  setNlpText(
                    '60 meals of hot mixed veg pulao and dal tadka in warm catering containers ready in Nungambakkam.'
                  )
                }
                className="text-amber-700 hover:underline bg-amber-50 px-2 py-0.5 rounded-md font-medium"
              >
                Catering Pulao
              </button>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeNLP}
              disabled={analyzing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 self-end sm:self-auto"
            >
              {analyzing ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Analyze with NLP
            </button>
          </div>

          {/* Visual Extracted Raw Summary */}
          {extractedData && (
            <div className="mt-4 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Extracted Values (Editable Below):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 font-medium">Food Name:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.foodName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Category:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.foodCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Diet Type:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.dietType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Quantity:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {extractedData.quantity} {extractedData.unit} ({extractedData.servings} people)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Prepared At:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.preparedAt}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Consume Before:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.consumeBefore}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Urgency:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.urgency}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Storage:</span>{' '}
                  <span className="font-bold text-slate-900">{extractedData.storageCondition}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Step 2: Verification and Form Submission */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          title="Review & Confirm Donation Details"
          subtitle="You can modify any extracted values before final publishing"
        >
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Food Item Name"
                name="food_name"
                value={formData.food_name}
                onChange={handleInputChange}
                placeholder="e.g. Vegetarian Biryani"
                required
              />

              <FormInput
                label="Food Category"
                name="food_category"
                type="select"
                value={formData.food_category}
                onChange={handleInputChange}
                options={foodCategoryOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Quantity"
                name="quantity"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />

              <FormInput
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="packets, meals, kg, trays"
                required
              />

              <FormInput
                label="Servings (Number of People)"
                name="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                label="Dispatch Urgency"
                name="urgency"
                type="select"
                value={formData.urgency}
                onChange={handleInputChange}
                options={urgencyOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Preparation Timestamp"
                name="prepared_at"
                type="datetime-local"
                value={formData.prepared_at}
                onChange={handleInputChange}
                helperText="Approximate time food was cooked/baked"
              />

              <FormInput
                label="Consume Before Deadline"
                name="consume_before"
                type="datetime-local"
                value={formData.consume_before}
                onChange={handleInputChange}
                helperText="Must be consumed and distributed by this time"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Storage Condition"
                name="storage_condition"
                type="select"
                value={formData.storage_condition}
                onChange={handleInputChange}
                options={storageOptions}
              />

              <FormInput
                label="Packaging Condition"
                name="packaging_condition"
                value={formData.packaging_condition}
                onChange={handleInputChange}
                placeholder="e.g. Individual foil containers"
              />

              <FormInput
                label="Known Allergens"
                name="allergens"
                value={formData.allergens}
                onChange={handleInputChange}
                placeholder="e.g. None, or Peanuts, Dairy"
              />
            </div>

            <FormInput
              label="Description & Food Handling Notes"
              name="description"
              type="textarea"
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Freshly prepared vegetarian biryani with raita and brinjal curry."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <FormInput
                  label="Pickup Address"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleInputChange}
                  placeholder="12 Anna Salai, T. Nagar"
                  required
                />
              </div>

              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Chennai"
                required
              />
            </div>
          </div>

          {/* Section 8: Food Safety Advisory Reminder */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Food Safety Notice:</span> Please ensure hygiene during packaging and storage. Our local rule system flags deadlines to optimize distribution time, but donors maintain primary responsibility for food safety prior to handoff.
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/donor/donations')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Utensils className="w-4 h-4" />
              )}
              Publish Donation
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
