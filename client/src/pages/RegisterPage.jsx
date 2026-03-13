import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        phone: data.phone,
        whatsapp: data.whatsapp,
        country: data.country || 'Mozambique',
        emergencyContact: {
          name: data.emergencyName,
          phone: data.emergencyPhone,
          relationship: data.emergencyRelationship,
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <section className="hidden w-2/5 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 p-10 text-white lg:flex">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-200">Dondo Scheduler</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">Create your team account in minutes.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100/90">
              Set up your profile, register emergency contacts, and start coordinating events with full visibility.
            </p>
          </div>

          <div className="space-y-3 text-sm text-brand-100/90">
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Standardized event workflow across departments</p>
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Status updates and follow-ups in one timeline</p>
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Built for field operations and admin oversight</p>
          </div>
        </section>

        <section className="w-full bg-white p-6 sm:p-8 lg:w-3/5 lg:p-10">
          <div className="mb-7 text-center lg:text-left">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-600 lg:hidden">Dondo Scheduler</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">Fill in your details below to start planning and tracking events.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name *</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    autoComplete="name"
                    {...register('name', { required: 'Required' })}
                  />
                  {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email *</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    autoComplete="email"
                    {...register('email', { required: 'Required' })}
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Password *</label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    autoComplete="new-password"
                    {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  />
                  {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact Info</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    placeholder="+258 ..."
                    autoComplete="tel"
                    {...register('phone')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">WhatsApp</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    placeholder="+258 ..."
                    {...register('whatsapp')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    {...register('department')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Country</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    defaultValue="Mozambique"
                    {...register('country')}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Emergency Contact</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    {...register('emergencyName')}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    {...register('emergencyPhone')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Relationship</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                    placeholder="e.g. Spouse, Parent"
                    {...register('emergencyRelationship')}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-800/30 transition hover:bg-brand-800 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 lg:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-800 hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
