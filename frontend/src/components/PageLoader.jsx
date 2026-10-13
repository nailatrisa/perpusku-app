export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto"></div>
        <p className="mt-3 text-sm text-dark-400">Memuat...</p>
      </div>
    </div>
  );
}