export default function Loading({ text = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="spinner"></div>
      <p className="mt-4 text-sm text-dark-400">{text}</p>
    </div>
  );
}