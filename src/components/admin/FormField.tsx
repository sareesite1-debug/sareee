interface FormFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

const FormField = ({ label, value, onChange, type = "text", placeholder, required, options }: FormFieldProps) => (
  <div>
    <label className="block text-xs font-body font-medium uppercase tracking-wider mb-1.5">{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-border bg-background px-4 py-2.5 text-sm font-body rounded-md">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-border bg-background px-4 py-2.5 text-sm font-body rounded-md min-h-[80px]" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full border border-border bg-background px-4 py-2.5 text-sm font-body rounded-md" />
    )}
  </div>
);

export default FormField;
