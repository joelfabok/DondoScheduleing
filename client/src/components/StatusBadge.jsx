const STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved:  { label: 'Approved',  cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  active:    { label: 'Active',    cls: 'bg-brand-100 text-brand-800 border-brand-200' },
  complete:  { label: 'Complete',  cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}
