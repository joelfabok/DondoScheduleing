import { useForm, useFieldArray } from 'react-hook-form';

export default function FollowupForm({ onSubmit, submitting, defaultValues }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: defaultValues || {
      outcome: '',
      objectivesAchieved: true,
      incidents: '',
      recommendations: '',
      actualSpend: '',
      currency: 'MZN',
      contactsMade: [],
      actionItems: [],
    },
  });

  const { fields: contacts, append: addContact, remove: removeContact } = useFieldArray({ control, name: 'contactsMade' });
  const { fields: actions, append: addAction, remove: removeAction } = useFieldArray({ control, name: 'actionItems' });

  const Section = ({ title }) => (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2 pb-1 border-b border-gray-100">{title}</h3>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Section title="Outcome" />
      <div>
        <label className="label">Summary of Outcome *</label>
        <textarea className="input resize-none" rows={4} placeholder="What happened? What was accomplished?" {...register('outcome', { required: 'Required' })} />
        {errors.outcome && <p className="field-error">{errors.outcome.message}</p>}
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="objectivesAchieved" className="w-4 h-4 text-brand-600" {...register('objectivesAchieved')} />
        <label htmlFor="objectivesAchieved" className="text-sm text-gray-700">Objectives were achieved</label>
      </div>
      <div>
        <label className="label">Incidents or Issues</label>
        <textarea className="input resize-none" rows={2} placeholder="Any incidents, problems, or safety issues…" {...register('incidents')} />
      </div>

      <Section title="Actual Spend" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label">Actual Amount Spent</label>
          <input type="number" className="input" placeholder="0.00" {...register('actualSpend')} />
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

      <Section title="Contacts Made" />
      <div className="space-y-3">
        {contacts.map((field, i) => (
          <div key={field.id} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="input" {...register(`contactsMade.${i}.name`)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" {...register(`contactsMade.${i}.phone`)} />
              </div>
              <div>
                <label className="label">Organization</label>
                <input className="input" {...register(`contactsMade.${i}.organization`)} />
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" {...register(`contactsMade.${i}.notes`)} />
              </div>
            </div>
            <button type="button" onClick={() => removeContact(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addContact({ name: '', phone: '', organization: '', notes: '' })} className="btn-secondary text-xs">
          + Add contact
        </button>
      </div>

      <Section title="Action Items" />
      <div className="space-y-3">
        {actions.map((field, i) => (
          <div key={field.id} className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="col-span-2">
                <label className="label">Description</label>
                <input className="input" placeholder="What needs to happen?" {...register(`actionItems.${i}.description`)} />
              </div>
              <div>
                <label className="label">Assigned To</label>
                <input className="input" {...register(`actionItems.${i}.assignedTo`)} />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" {...register(`actionItems.${i}.dueDate`)} />
              </div>
            </div>
            <button type="button" onClick={() => removeAction(i)} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addAction({ description: '', assignedTo: '', dueDate: '' })} className="btn-secondary text-xs">
          + Add action item
        </button>
      </div>

      <Section title="Recommendations" />
      <div>
        <textarea className="input resize-none" rows={3} placeholder="Lessons learned, recommendations for future trips…" {...register('recommendations')} />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center sm:w-auto">
          {submitting ? 'Saving…' : 'Submit Follow-Up'}
        </button>
      </div>
    </form>
  );
}
