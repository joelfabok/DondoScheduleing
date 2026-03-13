import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [helperForm, setHelperForm] = useState({ name: '', phone: '', specialty: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([api.get('/users'), api.get('/helpers')])
      .then(([usersRes, helpersRes]) => {
        setUsers(usersRes.data);
        setHelpers(helpersRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (u, nextRoleLabel) => {
    const nextRole = nextRoleLabel === 'user' ? 'staff' : nextRoleLabel;
    if (u.role === nextRole) return;
    if (!confirm(`Change ${u.name} to ${nextRoleLabel}?`)) return;
    try {
      await api.put(`/users/${u._id}/role`, { role: nextRoleLabel });
      load();
    } catch { alert('Failed to update role'); }
  };

  const removeUser = async (u) => {
    if (!confirm(`Remove ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch { alert('Failed to remove user'); }
  };

  const addHelper = async (e) => {
    e.preventDefault();
    if (!helperForm.name.trim()) return;
    try {
      await api.post('/helpers', {
        name: helperForm.name.trim(),
        phone: helperForm.phone.trim(),
        specialty: helperForm.specialty.trim(),
        notes: helperForm.notes.trim(),
      });
      setHelperForm({ name: '', phone: '', specialty: '', notes: '' });
      load();
    } catch {
      alert('Failed to add helper');
    }
  };

  const deactivateHelper = async (helper) => {
    if (!confirm(`Deactivate helper ${helper.name}?`)) return;
    try {
      await api.delete(`/helpers/${helper._id}`);
      load();
    } catch {
      alert('Failed to deactivate helper');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5">Users & Helpers</h1>

      <div className="card divide-y divide-gray-100 mb-6">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          users.map((u) => (
            <div key={u._id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                    {u.name}
                    {u._id === me._id && <span className="text-xs text-gray-400">(you)</span>}
                  </div>
                  <div className="text-xs text-gray-500 break-words">
                    {u.email}{u.department ? ` · ${u.department}` : ''}
                    {u.phone ? ` · ${u.phone}` : ''}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === 'admin' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {u.role === 'admin' ? 'admin' : 'user'}
                </span>
                {u._id !== me._id && (
                  <>
                    <select
                      className="input h-8 w-auto py-1 text-xs"
                      value={u.role === 'admin' ? 'admin' : 'user'}
                      onChange={(e) => changeRole(u, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => removeUser(u)} className="btn-ghost text-xs text-red-500">
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Helper Contacts</h2>
        <p className="text-sm text-gray-500 mb-4">Add non-staff helpers so they appear in the event team member picker.</p>

        <form onSubmit={addHelper} className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              value={helperForm.name}
              onChange={(e) => setHelperForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={helperForm.phone}
              onChange={(e) => setHelperForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Specialty</label>
            <input
              className="input"
              placeholder="e.g. Driver, Translator, Logistics"
              value={helperForm.specialty}
              onChange={(e) => setHelperForm((prev) => ({ ...prev, specialty: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <input
              className="input"
              value={helperForm.notes}
              onChange={(e) => setHelperForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">Add Helper</button>
          </div>
        </form>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {helpers.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No helpers added yet.</div>
          ) : (
            helpers.map((helper) => (
              <div key={helper._id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900">{helper.name}</div>
                  <div className="text-xs text-gray-500 break-words">
                    {helper.specialty || 'Helper'}
                    {helper.phone ? ` · ${helper.phone}` : ''}
                    {helper.notes ? ` · ${helper.notes}` : ''}
                  </div>
                </div>
                <div>
                  <button onClick={() => deactivateHelper(helper)} className="btn-ghost text-xs text-red-500">Deactivate</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
