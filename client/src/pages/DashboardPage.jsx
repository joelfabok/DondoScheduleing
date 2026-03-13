import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const StatCard = ({ label, value, color }) => (
  <div className="card p-4">
    <div className={`text-2xl font-semibold ${color}`}>{value}</div>
    <div className="text-sm text-gray-500 mt-0.5">{label}</div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then((r) => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = {
    pending: events.filter((e) => e.status === 'pending').length,
    approved: events.filter((e) => e.status === 'approved').length,
    active: events.filter((e) => e.status === 'active').length,
    complete: events.filter((e) => e.status === 'complete').length,
  };

  const upcoming = events
    .filter((e) => ['approved', 'active', 'pending'].includes(e.status))
    .sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {user?.role === 'admin' ? 'Admin view — all events' : 'Your events overview'}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pending Review" value={counts.pending} color="text-yellow-600" />
        <StatCard label="Approved" value={counts.approved} color="text-blue-600" />
        <StatCard label="Active" value={counts.active} color="text-brand-600" />
        <StatCard label="Completed" value={counts.complete} color="text-gray-600" />
      </div>

      {/* Upcoming */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-800">Upcoming Events</h2>
          <Link to="/events" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : upcoming.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No upcoming events.{' '}
            <Link to="/events/new" className="text-brand-600 hover:underline">Create one</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.map((event) => (
              <Link key={event._id} to={`/events/${event._id}`} className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:items-center">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{event.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {event.destination} · {format(new Date(event.departureDate), 'MMM d, yyyy')}
                    {user?.role === 'admin' && ` · ${event.submittedBy?.name}`}
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={event.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {user?.role === 'admin' && counts.pending > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-yellow-800">
            <strong>{counts.pending}</strong> event{counts.pending !== 1 ? 's' : ''} waiting for your review
          </p>
          <Link to="/events?status=pending" className="btn-secondary w-full justify-center text-xs sm:w-auto">Review now</Link>
        </div>
      )}
    </div>
  );
}
