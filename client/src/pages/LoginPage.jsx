import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <section className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 p-10 text-white lg:flex">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-200">Dondo Scheduler</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight">
              Run every event with clarity and confidence.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100/90">
              Centralize planning, ownership, and follow-ups in one workflow designed for fast-moving teams.
            </p>
          </div>

          <div className="space-y-3 text-sm text-brand-100/90">
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              Live status tracking for every event stage
            </p>
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              Structured follow-ups that keep teams accountable
            </p>
            <p className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              Secure, role-based access for organizers and admins
            </p>
          </div>
        </section>

        <section className="w-full bg-white p-6 sm:p-8 lg:w-1/2 lg:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-600 lg:hidden">Dondo Scheduler</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to manage events, assign next steps, and track outcomes.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                placeholder="********"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-800/30 transition hover:bg-brand-800 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 lg:text-left">
            No account?{' '}
            <Link to="/register" className="font-medium text-brand-700 transition hover:text-brand-800 hover:underline">
              Register here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
