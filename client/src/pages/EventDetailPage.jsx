import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import FollowupForm from '../components/FollowupForm';

const STATUSES = ['pending', 'approved', 'active', 'complete', 'cancelled'];

const Detail = ({ label, value }) => value ? (
  <div>
    <dt className="text-xs text-gray-500 font-medium">{label}</dt>
    <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
  </div>
) : null;

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', adminNotes: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get('/followups', { params: { event: id } }),
    ]).then(([eRes, fRes]) => {
      setEvent(eRes.data);
      setFollowups(fRes.data);
      setLoading(false);
    }).catch(() => navigate('/events'));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    try {
      const res = await api.patch(`/events/${id}/status`, statusUpdate);
      setEvent(res.data);
      setShowStatusModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFollowupSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/followups', { ...data, event: id });
      setShowFollowupForm(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit follow-up');
    }
    setSubmitting(false);
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post(`/events/${id}/duplicate`);
      navigate(`/events/${res.data._id}/edit`);
    } catch (err) {
      alert('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete');
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/events/${id}/pdf`, '_blank');
  };

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading…</div>;
  if (!event) return null;

  const isOwner = String(event.submittedBy?._id) === String(user._id);
  const isAdmin = user.role === 'admin';
  const canEdit = isAdmin || (isOwner && event.status === 'pending');

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/events" className="hover:text-brand-600">Events</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{event.title}</span>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-semibold text-gray-900">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-sm text-gray-500">
            Submitted by {event.submittedBy?.name} · {format(new Date(event.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          {canEdit && (
            <Link to={`/events/${id}/edit`} className="btn-secondary w-full justify-center text-xs sm:w-auto">Edit</Link>
          )}
          {isAdmin && (
            <button onClick={() => { setStatusUpdate({ status: event.status, adminNotes: event.adminNotes || '' }); setShowStatusModal(true); }} className="btn-primary w-full justify-center text-xs sm:w-auto">
              Update Status
            </button>
          )}
          <button onClick={handleDownloadPDF} className="btn-secondary w-full justify-center text-xs sm:w-auto">
            PDF
          </button>
          <button onClick={handleDuplicate} className="btn-ghost w-full justify-center text-xs sm:w-auto">Duplicate</button>
          {(isAdmin || (isOwner && event.status === 'pending')) && (
            <button onClick={handleDelete} className="btn-ghost w-full justify-center text-xs text-red-500 sm:w-auto">Delete</button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-4 mb-4">
        <StatusTimeline status={event.status} />
        {event.adminNotes && (
          <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-700">Admin note: </span>{event.adminNotes}
          </p>
        )}
      </div>

      {/* Details Grid */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Event Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Destination" value={event.destination} />
          <Detail label="Departing From" value={event.departureLocation} />
          <Detail label="Departure Date" value={format(new Date(event.departureDate), 'EEEE, MMMM d, yyyy')} />
          <Detail label="Return Date" value={format(new Date(event.returnDate), 'EEEE, MMMM d, yyyy')} />
          <div className="col-span-2">
            <Detail label="Purpose" value={event.purpose} />
          </div>
          {event.estimatedBudget && (
            <Detail label="Estimated Budget" value={`${Number(event.estimatedBudget).toLocaleString()} ${event.currency}`} />
          )}
        </dl>
      </div>

      {/* Submitter contact */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Submitter Contact</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Name" value={event.submittedBy?.name} />
          <Detail label="Department" value={event.submittedBy?.department} />
          <Detail label="Phone" value={event.submittedBy?.phone} />
          <Detail label="WhatsApp" value={event.submittedBy?.whatsapp} />
          <Detail label="Email" value={event.submittedBy?.email} />
        </dl>
      </div>

      {/* Travelers */}
      {event.travelers?.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Travelers</h2>
          <ul className="divide-y divide-gray-100">
            {event.travelers.map((t, i) => (
              <li key={i} className="py-2 text-sm">
                <span className="font-medium">{t.user?.name || t.helper?.name || t.name}</span>
                {(t.user?.phone || t.helper?.phone || t.phone) && <span className="text-gray-500 ml-2">· {t.user?.phone || t.helper?.phone || t.phone}</span>}
                {t.user?.whatsapp && <span className="text-gray-500 ml-2">· WA: {t.user.whatsapp}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Local Contact */}
      {event.localContact?.name && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Local Contact</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Name" value={event.localContact.name} />
            <Detail label="Phone" value={event.localContact.phone} />
            <Detail label="Organization" value={event.localContact.organization} />
          </dl>
        </div>
      )}

      {/* Transport */}
      {event.vehicleRequired && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Transport</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Vehicle" value={event.vehicleAsset?.name || event.vehicleDetails} />
            <Detail label="Vehicle Notes" value={event.vehicleAsset?.name ? event.vehicleDetails : ''} />
            <Detail label="Driver" value={event.driverContact?.name} />
            <Detail label="Driver Phone" value={event.driverContact?.phone} />
          </dl>
        </div>
      )}

      {/* Supplies */}
      {event.supplies?.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Supplies / Equipment</h2>
          <ul className="space-y-1">
            {event.supplies.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.notes && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-2">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{event.notes}</p>
        </div>
      )}

      {/* Status History */}
      {event.statusHistory?.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">Status History</h2>
          <ul className="space-y-2">
            {event.statusHistory.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <StatusBadge status={h.status} />
                <span className="text-gray-500">
                  {h.changedBy?.name} · {format(new Date(h.changedAt), 'MMM d, yyyy HH:mm')}
                  {h.note && <span className="ml-1 italic">— {h.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-ups */}
      <div className="mb-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-800">Follow-Up Reports ({followups.length})</h2>
          {(isOwner || isAdmin) && event.status === 'complete' && (
            <button onClick={() => setShowFollowupForm(!showFollowupForm)} className="btn-secondary w-full justify-center text-xs sm:w-auto">
              {showFollowupForm ? 'Cancel' : '+ Add Follow-Up'}
            </button>
          )}
        </div>

        {showFollowupForm && (
          <div className="card p-5 mb-3">
            <h3 className="font-medium text-gray-800 mb-4">New Follow-Up Report</h3>
            <FollowupForm onSubmit={handleFollowupSubmit} submitting={submitting} />
          </div>
        )}

        {followups.map((f) => (
          <div key={f._id} className="card p-5 mb-3">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-sm text-gray-900">{f.submittedBy?.name}</p>
                <p className="text-xs text-gray-500">{format(new Date(f.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${f.objectivesAchieved ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {f.objectivesAchieved ? 'Objectives met' : 'Objectives not met'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{f.outcome}</p>
            {f.incidents && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mb-3">
                <strong>Incidents:</strong> {f.incidents}
              </div>
            )}
            {f.actualSpend && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Actual spend:</strong> {Number(f.actualSpend).toLocaleString()} {f.currency}
              </p>
            )}
            {f.contactsMade?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contacts Made</p>
                <ul className="space-y-1">
                  {f.contactsMade.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700">{c.name}{c.organization ? ` — ${c.organization}` : ''}{c.phone ? ` (${c.phone})` : ''}</li>
                  ))}
                </ul>
              </div>
            )}
            {f.actionItems?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Action Items</p>
                <ul className="space-y-1">
                  {f.actionItems.map((a, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className={`mt-0.5 w-3 h-3 rounded-sm border shrink-0 ${a.done ? 'bg-brand-500 border-brand-500' : 'border-gray-400'}`} />
                      {a.description}{a.assignedTo ? ` → ${a.assignedTo}` : ''}{a.dueDate ? ` (due ${format(new Date(a.dueDate), 'MMM d')})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {f.recommendations && (
              <p className="text-sm text-gray-600"><strong>Recommendations:</strong> {f.recommendations}</p>
            )}
          </div>
        ))}

        {followups.length === 0 && !showFollowupForm && (
          <div className="card p-5 text-center text-gray-400 text-sm">
            {event.status === 'complete' ? 'No follow-up reports yet.' : 'Follow-up reports can be added once the event is marked complete.'}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Update Event Status</h2>
            <div className="mb-3">
              <label className="label">New Status</label>
              <select className="input" value={statusUpdate.status} onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="label">Admin Note (optional)</label>
              <textarea className="input resize-none" rows={3} value={statusUpdate.adminNotes} onChange={(e) => setStatusUpdate({ ...statusUpdate, adminNotes: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={!statusUpdate.status} className="btn-primary">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
