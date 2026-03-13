import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['', 'pending', 'approved', 'active', 'complete', 'cancelled'];
const STATUS_LABELS = { '': 'All', pending: 'Pending', approved: 'Approved', active: 'Active', complete: 'Complete', cancelled: 'Cancelled' };

export default function EventsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    api.get('/events', { params })
      .then((r) => { setEvents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, search]);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
        <Link to="/events/new" className="btn-primary w-full justify-center sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              statusFilter === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <div className="w-full sm:ml-auto sm:w-64">
          <input
            type="text"
            placeholder="Search title, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full !py-2 text-sm"
          />
        </div>
      </div>

      <div className="card divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No events found.{' '}
            <Link to="/events/new" className="text-brand-600 hover:underline">Create one</Link>
          </div>
        ) : (
          events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="group flex items-start justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm group-hover:text-brand-700">{event.title}</span>
                  <StatusBadge status={event.status} />
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>{event.destination}</span>
                  <span>{format(new Date(event.departureDate), 'MMM d')} - {format(new Date(event.returnDate), 'MMM d, yyyy')}</span>
                  {user?.role === 'admin' && <span>{event.submittedBy?.name}</span>}
                  {event.travelers?.length > 0 && <span>{event.travelers.length + 1} travelers</span>}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
