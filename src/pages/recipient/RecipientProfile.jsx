import React, { useState, useEffect } from 'react';
import { User, Building2, Heart, Save } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import Card from '../../components/Card';

export default function RecipientProfile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    contact_person: user?.profile?.contact_person || '',
    organization_type: user?.profile?.organization_type || 'NGO',
    address: user?.profile?.address || '',
    city: user?.profile?.city || 'Chennai',
    state: user?.profile?.state || 'Tamil Nadu',
    pincode: user?.profile?.pincode || '',
    capacity: user?.profile?.capacity || 50,
    registration_number: user?.profile?.registration_number || ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        contact_person: user.profile?.contact_person || '',
        organization_type: user.profile?.organization_type || 'NGO',
        address: user.profile?.address || '',
        city: user.profile?.city || 'Chennai',
        state: user.profile?.state || 'Tamil Nadu',
        pincode: user.profile?.pincode || '',
        capacity: user.profile?.capacity || 50,
        registration_number: user.profile?.registration_number || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data?.success) {
        showToast('Recipient profile updated successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const orgTypes = [
    { value: 'NGO', label: 'NGO / Charity Organization' },
    { value: 'ORPHANAGE', label: 'Orphanage Trust' },
    { value: 'SHELTER', label: 'Shelter Home' },
    { value: 'COMMUNITY_CENTER', label: 'Community Center' },
    { value: 'INDIVIDUAL', label: 'Individual Beneficiary' },
    { value: 'OTHER', label: 'Other Welfare Entity' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recipient Organization Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your beneficiary center profile, capacity, and default delivery coordinates
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Organization / Center Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Contact Person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Organization Type"
              name="organization_type"
              type="select"
              value={formData.organization_type}
              onChange={handleChange}
              options={orgTypes}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Beneficiary Capacity (People)"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              helperText="Average daily beneficiaries supported"
            />

            <FormInput
              label="Registration / Trust Number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="e.g. NGO-TN-2018-8834"
            />
          </div>

          <FormInput
            label="Default Receiving / Center Address"
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
              required
            />
            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
