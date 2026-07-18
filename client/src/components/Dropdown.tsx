import { FiChevronDown } from 'react-icons/fi';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}

export const Dropdown = ({ value, onChange, options, placeholder, disabled }: DropdownProps) => {
  return (
    <div className={`native-dropdown-wrapper ${disabled ? 'disabled' : ''}`} style={{ position: 'relative', width: '100%' }}>
      <select
        className="native-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem 2.5rem 0.75rem 1rem',
          appearance: 'none',
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-main)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <FiChevronDown 
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }} 
      />
    </div>
  );
};
