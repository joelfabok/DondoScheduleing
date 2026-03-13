import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function EventForm({ defaultValues, onSubmit, submitting }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [vehicleAssets, setVehicleAssets] = useState([]);
  const [supplyInput, setSupplyInput] = useState('');

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      title: '',
      purpose: '',
      destination: '',
      departureLocation: '',
      departureDate: '',
      returnDate: '',
      vehicleRequired: false,
      travelers: [],
      supplies: [],
      estimatedBudget: '',
      currency: 'MZN',
      notes: '',
      localContact: { name: '', phone: '', organization: '' },
      driverContact: { name: '', phone: '' },
    },
  });

  const { fields: travelerFields, append: addTraveler, remove: removeTraveler } = useFieldArray({ control, name: 'travelers' });
  const { fields: supplyFields, append: addSupply, remove: removeSupply } = useFieldArray({ control, name: 'supplies' });
  const travelers = watch('travelers') || [];
  const selectedVehicleAsset = watch('vehicleAsset');
  const vehicleRequired = watch('vehicleRequired');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/helpers'), api.get('/assets', { params: { type: 'vehicle' } })]).then(([usersRes, helpersRes, assetsRes]) => {
      setUsers(usersRes.data.filter((u) => u._id !== user._id));
      setHelpers(helpersRes.data);
      setVehicleAssets(assetsRes.data);
    });
  }, [user?._id]);

  const handleTravelerSelect = (index, value) => {
    if (!value) {
      setValue(`travelers.${index}.user`, '');
      setValue(`travelers.${index}.helper`, '');
      setValue(`travelers.${index}.name`, '');
      setValue(`travelers.${index}.phone`, '');
      return;
    }

    const [type, id] = value.split(':');

    if (type === 'user') {
      setValue(`travelers.${index}.user`, id);
      setValue(`travelers.${index}.helper`, '');
      setValue(`travelers.${index}.name`, '');
      setValue(`travelers.${index}.phone`, '');
      return;
    }

    if (type === 'helper') {
      const helper = helpers.find((h) => h._id === id);
      setValue(`travelers.${index}.user`, '');
      setValue(`travelers.${index}.helper`, id);
      setValue(`travelers.${index}.name`, helper?.name || '');
      setValue(`travelers.${index}.phone`, helper?.phone || '');
    }
  };

  const handleAddSupply = () => {
    if (supplyInput.trim()) {
      addSupply(supplyInput.trim());
      setSupplyInput('');
    }
  };

  const Section = ({ title }) => (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2 pb-1 border-b border-gray-100">{title}</h3>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Section title="Event Details" />
      <div>
        <label className="label">Event Title *</label>
        <input className="input" placeholder="e.g. Field visit to Nampula Province" {...register('title', { required: 'Required' })} />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>
      <div>
        <label className="label">Purpose / Objective *</label>
        <textarea className="input resize-none" rows={3} placeholder="Describe the purpose of this trip…" {...register('purpose', { required: 'Required' })} />
        {errors.purpose && <p className="field-error">{errors.purpose.message}</p>}
      </div>

      <Section title="Location & Dates" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Destination *</label>
          <input className="input" placeholder="e.g. Nampula, Mozambique" {...register('destination', { required: 'Required' })} />
          {errors.destination && <p className="field-error">{errors.destination.message}</p>}
        </div>
        <div>
          <label className="label">Departing From</label>
          <input className="input" placeholder="e.g. Maputo" {...register('departureLocation')} />
        </div>
        <div>
          <label className="label">Departure Date *</label>
          <input type="date" className="input" {...register('departureDate', { required: 'Required' })} />
          {errors.departureDate && <p className="field-error">{errors.departureDate.message}</p>}
        </div>
        <div>
          <label className="label">Return Date *</label>
          <input type="date" className="input" {...register('returnDate', { required: 'Required' })} />
          {errors.returnDate && <p className="field-error">{errors.returnDate.message}</p>}
        </div>
      </div>

      <Section title="Travelers" />
      <div className="space-y-2">
        {travelerFields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <input type="hidden" {...register(`travelers.${i}.user`)} />
            <input type="hidden" {...register(`travelers.${i}.helper`)} />
            <input type="hidden" {...register(`travelers.${i}.name`)} />
            <input type="hidden" {...register(`travelers.${i}.phone`)} />
            <select
              className="input flex-1"
              value={travelers[i]?.user ? `user:${travelers[i].user}` : travelers[i]?.helper ? `helper:${travelers[i].helper}` : ''}
              onChange={(e) => handleTravelerSelect(i, e.target.value)}
            >
              <option value="">— Select team member —</option>
              {users.length > 0 && <optgroup label="Staff">
                {users.map((u) => <option key={u._id} value={`user:${u._id}`}>{u.name} ({u.department || u.email})</option>)}
              </optgroup>}
              {helpers.length > 0 && <optgroup label="Helpers">
                {helpers.map((h) => <option key={h._id} value={`helper:${h._id}`}>{h.name}{h.specialty ? ` (${h.specialty})` : ''}</option>)}
              </optgroup>}
            </select>
            <button type="button" onClick={() => removeTraveler(i)} className="btn-ghost px-3 text-red-500">Remove</button>
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={() => addTraveler({ user: '', helper: '', name: '', phone: '' })} className="btn-secondary text-xs">
            + Add team member
          </button>
        </div>
      </div>

      <Section title="Local Contact (at destination)" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Contact Name</label>
          <input className="input" placeholder="Name of local contact" {...register('localContact.name')} />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input className="input" placeholder="+258 …" {...register('localContact.phone')} />
        </div>
        <div className="col-span-2">
          <label className="label">Organization</label>
          <input className="input" placeholder="Organization or partner" {...register('localContact.organization')} />
        </div>
      </div>

      <Section title="Transport" />
      <div className="flex items-center gap-3">
        <input type="checkbox" id="vehicleRequired" className="w-4 h-4 text-brand-600" {...register('vehicleRequired')} />
        <label htmlFor="vehicleRequired" className="text-sm text-gray-700">Vehicle required</label>
      </div>
      {vehicleRequired && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-2">
            <label className="label">Vehicle</label>
            <select className="input" {...register('vehicleAsset')}>
              <option value="">— Select vehicle from assets —</option>
              {vehicleAssets.map((asset) => (
                <option key={asset._id} value={asset._id}>{asset.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Admins can manage this list in the Assets section.</p>
          </div>
          <div className="col-span-2">
            <label className="label">Vehicle Details</label>
            <input
              className="input"
              placeholder="Type, plate number, rental, etc."
              {...register('vehicleDetails')}
              disabled={Boolean(selectedVehicleAsset)}
            />
          </div>
          <div>
            <label className="label">Driver Name</label>
            <input className="input" {...register('driverContact.name')} />
          </div>
          <div>
            <label className="label">Driver Phone</label>
            <input className="input" {...register('driverContact.phone')} />
          </div>
        </div>
      )}

      <Section title="Budget" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label">Estimated Budget</label>
          <input type="number" className="input" placeholder="0.00" {...register('estimatedBudget')} />
        </div>
        <div>
          <label className="label">Currency</label>
          <select className="input" {...register('currency')}>
            <option value="MZN">MZN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="ZAR">ZAR</option>
          </select>
        </div>
      </div>

      <Section title="Supplies / Equipment Needed" />
      <div>
        <div className="mb-2 flex gap-2">
          <input
            className="input"
            placeholder="Add item and press Enter or click Add"
            value={supplyInput}
            onChange={(e) => setSupplyInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSupply(); } }}
          />
          <button type="button" onClick={handleAddSupply} className="btn-secondary px-3">Add</button>
        </div>
        {supplyFields.length > 0 && (
          <ul className="space-y-1">
            {supplyFields.map((field, i) => (
              <li key={field.id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                <span className="flex-1">{field}</span>
                <button type="button" onClick={() => removeSupply(i)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Section title="Additional Notes" />
      <div>
        <textarea className="input resize-none" rows={3} placeholder="Any other notes, special requirements…" {...register('notes')} />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center sm:w-auto">
          {submitting ? 'Saving…' : 'Submit Event Request'}
        </button>
      </div>
    </form>
  );
}
