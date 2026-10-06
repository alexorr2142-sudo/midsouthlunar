/**
 * Accessible single-select chip row used for the Schedule and Vendors filters.
 * `options` is [[value, label], ...]; "all" is always offered first.
 */
export default function ChipGroup({ label, allLabel, options, value, onChange, name }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-semibold text-red-dark">{label}</legend>
      <div className="flex flex-wrap gap-2" role="group" data-testid={`filter-${name}`}>
        {[['all', allLabel], ...options].map(([v, l]) => (
          <button key={v} type="button" aria-pressed={value === v} data-value={v}
            className={`chip ${value === v ? 'chip-on' : 'bg-white hover:bg-cream'}`} onClick={() => onChange(v)}>
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
