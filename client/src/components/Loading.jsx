export default function Loading({ text = 'Memuat...' }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4" role="status">
      <div className="spinner" />
      <p className="text-sm text-dark-400">{text}</p>
    </div>
  );
}