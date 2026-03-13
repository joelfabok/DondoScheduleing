const STEPS = ['pending', 'approved', 'active', 'complete'];

const LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  active: 'Active',
  complete: 'Complete',
};

export default function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        Cancelled
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                active ? 'bg-brand-600 border-brand-600 text-white' :
                done   ? 'bg-brand-100 border-brand-400 text-brand-700' :
                         'bg-white border-gray-300 text-gray-400'
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-brand-700 font-medium' : done ? 'text-brand-500' : 'text-gray-400'}`}>
                {LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mb-4 mx-1 ${done || active ? 'bg-brand-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
