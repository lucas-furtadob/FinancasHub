interface StatusBadgeProps {
  status: 'Pendente' | 'Pago' | 'Recebido' | 'Realizado' | 'Ativa' | 'Inativa' | string;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  'Pendente': { bg: 'rgba(255, 92, 0, 0.1)', text: '#FF5C00', border: 'rgba(255, 92, 0, 0.2)' },
  'Pago': { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' },
  'Recebido': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
  'Realizado': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
  'Ativa': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
  'Inativa': { bg: 'rgba(107, 107, 112, 0.1)', text: '#6B6B70', border: 'rgba(107, 107, 112, 0.2)' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: 'rgba(107, 107, 112, 0.1)', text: '#6B6B70', border: 'rgba(107, 107, 112, 0.2)' };

  return (
    <span
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        padding: '4px 12px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {status}
    </span>
  );
}
