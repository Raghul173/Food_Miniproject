import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Utensils, Building2, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'RECIPIENT' ? 'RECIPIENT' : 'DONOR';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    contact_person: '',
    organization_type: role === 'DONOR' ? 'RESTAURANT' : 'NGO',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    fssai_license: '',
    capacity: 50,
    registration_number: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      organization_type: role === 'DONOR' ? 'RESTAURANT' : 'NGO'
    }));
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      role
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      showToast('Registration successful! Welcome to FoodShare.', 'success');
      if (role === 'DONOR') navigate('/donor/dashboard');
      else navigate('/recipient/dashboard');
    } else {
      setErrorMsg(res.message);
      showToast(res.message, 'error');
    }
  };

  const donorOrgOptions = [
    { value: 'RESTAURANT', label: 'Restaurant / Eatery' },
    { value: 'HOTEL', label: 'Hotel & Banquet' },
    { value: 'SUPERMARKET', label: 'Supermarket / Grocery' },
    { value: 'COLLEGE', label: 'College / University Mess' },
    { value: 'EVENT_ORGANIZER', label: 'Event / Wedding Organizer' },
    { value: 'HOUSEHOLD', label: 'Household / Individual Donor' },
    { value: 'OTHER', label: 'Other Commercial Kitchen' }
  ];

  const recipientOrgOptions = [
    { value: 'NGO', label: 'NGO / Charity' },
    { value: 'ORPHANAGE', label: 'Orphanage Trust' },
    { value: 'SHELTER', label: 'Shelter Home' },
    { value: 'COMMUNITY_CENTER', label: 'Community Center' },
    { value: 'INDIVIDUAL', label: 'Individual Beneficiary' },
    { value: 'OTHER', label: 'Other Welfare Entity' }
  ];

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Organization Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose whether you are donating surplus food or receiving for a community cause.
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'DONOR'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Food Donor
          </button>

          <button
            type="button"
            onClick={() => setRole('RECIPIENT')}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'RECIPIENT'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-amber-600" />
            Recipient NGO
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Organization / Entity Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={role === 'DONOR' ? 'e.g. Green Leaf Caterers' : 'e.g. Hope Community Shelter'}
              required
            />

            <FormInput
              label="Contact Person Name"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@entity.org"
              required
            />

            <FormInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Organization Category"
              name="organization_type"
              type="select"
              value={formData.organization_type}
              onChange={handleChange}
              options={role === 'DONOR' ? donorOrgOptions : recipientOrgOptions}
              required
            />

            {role === 'DONOR' ? (
              <FormInput
                label="FSSAI License / Registration"
                name="fssai_license"
                value={formData.fssai_license}
                onChange={handleChange}
                placeholder="FSSAI-12423001000123"
                helperText="Food safety registration helps fast-track verification"
              />
            ) : (
              <FormInput
                label="Beneficiary Capacity (People)"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="50"
                helperText="Estimated meals capacity per distribution"
              />
            )}
          </div>

          <FormInput
            label="Street Address / Location"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Door #, Street, Locality"
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Chennai"
              required
            />

            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Tamil Nadu"
              required
            />

            <FormInput
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="600017"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormInput
              label="Password (min. 6 characters)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 mt-4 ${
              role === 'DONOR'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Register as {role === 'DONOR' ? 'Donor' : 'Recipient'} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
