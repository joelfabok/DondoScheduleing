import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const typeLabel = {
  vehicle: 'Vehicle',
  equipment: 'Equipment',
  other: 'Other',
};

export default function AssetsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: 'vehicle', description: '' });

  const load = () => {
    api.get('/assets')
      .then((res) => {
        setAssets(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addAsset = async (e) => {
    e.preventDefault();
    if (!isAdmin || !form.name.trim()) return;

    try {
      await api.post('/assets', {
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
      });
      setForm({ name: '', type: 'vehicle', description: '' });
      load();
    } catch {
      alert('Failed to add asset');
    }
  };

  const deactivateAsset = async (asset) => {
    if (!isAdmin) return;
    if (!confirm(`Deactivate ${asset.name}?`)) return;

    try {
      await api.delete(`/assets/${asset._id}`);
      load();
    } catch {
      alert('Failed to deactivate asset');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Assets</h1>
      <p className="text-sm text-gray-500 mb-5">Shared resources like vehicles, equipment, and other items used in events.</p>

      {isAdmin && (
        <div className="card p-4 sm:p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Add New Asset</h2>
          <form onSubmit={addAsset} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="vehicle">Vehicle</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input
                className="input"
                placeholder="Optional details"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Add Asset</button>
            </div>
          </form>
        </div>
      )}

      <div className="card divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : assets.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No assets added yet.</div>
        ) : (
          assets.map((asset) => (
            <div key={asset._id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-900">{asset.name}</div>
                <div className="text-xs text-gray-500 break-words">
                  {typeLabel[asset.type] || asset.type}
                  {asset.description ? ` · ${asset.description}` : ''}
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => deactivateAsset(asset)} className="btn-ghost text-xs text-red-500">Deactivate</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
