import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      whatsapp: user?.whatsapp || '',
      department: user?.department || '',
      country: user?.country || 'Mozambique',
      emergencyName: user?.emergencyContact?.name || '',
      emergencyPhone: user?.emergencyContact?.phone || '',
      emergencyRelationship: user?.emergencyContact?.relationship || '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setSaved(false);
    setError('');
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        department: data.department,
        country: data.country,
        emergencyContact: {
          name: data.emergencyName,
          phone: data.emergencyPhone,
          relationship: data.emergencyRelationship,
        },
      };
      if (data.password) payload.password = data.password;
      const res = await api.put('/users/me', payload);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const Section = ({ title }) => (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2 pb-1 border-b border-gray-100">{title}</h3>
  );

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-lg">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email} · <span className="capitalize">{user?.role}</span></p>
        </div>
      </div>

      {saved && <div className="mb-4 p-3 bg-brand-50 border border-brand-200 text-brand-700 text-sm rounded">Profile updated ✓</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}

      <div className="card p-4 sm:p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Section title="Personal Info" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="label">Full Name</label>
              <input className="input" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" {...register('department')} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" {...register('country')} />
            </div>
          </div>

          <Section title="Contact" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+258 …" {...register('phone')} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" placeholder="+258 …" {...register('whatsapp')} />
            </div>
          </div>

          <Section title="Emergency Contact" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" {...register('emergencyName')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('emergencyPhone')} />
            </div>
            <div className="col-span-2">
              <label className="label">Relationship</label>
              <input className="input" placeholder="Spouse, Parent, etc." {...register('emergencyRelationship')} />
            </div>
          </div>

          <Section title="Change Password" />
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Leave blank to keep current" {...register('password')} />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center sm:w-auto">
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
