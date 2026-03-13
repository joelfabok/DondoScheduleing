import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api';
import EventForm from '../components/EventForm';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`).then((r) => setEvent(r.data)).catch(() => navigate('/events'));
  }, [id]);

  if (!event) return <div className="p-4 text-sm text-gray-400 sm:p-6">Loading…</div>;

  const defaults = {
    ...event,
    departureDate: format(new Date(event.departureDate), 'yyyy-MM-dd'),
    returnDate: format(new Date(event.returnDate), 'yyyy-MM-dd'),
    vehicleAsset: event.vehicleAsset?._id || '',
    travelers: event.travelers?.map((t) => ({ user: t.user?._id || '', helper: t.helper?._id || '', name: t.name || '', phone: t.phone || '' })) || [],
  };

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    try {
      data.travelers = (data.travelers || []).filter((t) => t.user || t.helper || t.name);
      await api.put(`/events/${id}`, data);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/events" className="hover:text-brand-600">Events</Link>
        <span>/</span>
        <Link to={`/events/${id}`} className="hover:text-brand-600">{event.title}</Link>
        <span>/</span>
        <span className="text-gray-900">Edit</span>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Event</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}
      <div className="card p-4 sm:p-6">
        <EventForm defaultValues={defaults} onSubmit={onSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
