import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900/40 flex items-center justify-center p-4">
          <div className="bg-dark-900/60 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h1>
            <p className="text-sm text-dark-400 mb-6">
              Maaf, ada masalah saat memuat halaman ini. Silakan muat ulang.
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-rose-50 rounded-lg text-xs text-rose-700 font-mono text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button onClick={() => window.location.reload()} className="btn-primary w-full py-3">
              <RotateCcw size={18} /> Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}