import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  options = [], // for select type
  rows = 3,     // for textarea type
  className = '',
  disabled = false,
  readOnly = false,
  min,
  max,
  step
}) {
  const baseInputStyles = `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
    error
      ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-emerald-600/20'
  }`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`${baseInputStyles} resize-y`}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputStyles} bg-white cursor-pointer`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          className={baseInputStyles}
        />
      )}

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
