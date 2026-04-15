export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 14px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.03)',
        minWidth: 120,
      }}
    >
      <span style={{ color: '#9ca3af', fontSize: 12 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
