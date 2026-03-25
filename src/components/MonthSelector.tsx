interface MonthSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(value);
    newDate.setMonth(newDate.getMonth() + delta);
    onChange(newDate);
  };

  return (
    <button
      className="month-selector"
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        padding: '10px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#FFF',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6B6B70"
        strokeWidth="2"
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>
        {formatMonth(value)}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6B6B70"
        strokeWidth="2"
        style={{ cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
