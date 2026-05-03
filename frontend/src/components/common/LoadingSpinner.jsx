export default function LoadingSpinner({ fullscreen }) {
  const style = fullscreen
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' };

  return (
    <div style={style}>
      <div style={{
        width: 28, height: 28,
        border: '2.5px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
