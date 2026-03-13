import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import EventForm from '../components/EventForm';

export default function NewEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    try {
      // Clean up travelers — remove empty entries
      data.travelers = (data.travelers || []).filter((t) => t.user || t.helper || t.name);
      const res = await api.post('/events', data);
      navigate(`/events/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/events" className="hover:text-brand-600">Events</Link>
        <span>/</span>
        <span className="text-gray-900">New Event</span>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Event Request</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
      )}
      <div className="card p-4 sm:p-6">
        <EventForm onSubmit={onSubmit} submitting={submitting} />
      </div>
    </div>
  );
}
