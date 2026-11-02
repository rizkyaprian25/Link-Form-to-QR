import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  pesanError: string;
}

/**
 * Global Error Boundary
 * Menangkap kegagalan rendering komponen secara elegan untuk mencegah layar putih (white screen).
 * Menyediakan opsi muat ulang lokal tanpa kehilangan data penyimpanan.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    pesanError: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      pesanError: error.message || 'Terjadi kesalahan sistem saat merender kanvas antarmuka.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catat log kesalahan secara terstruktur untuk audit internal (tanpa kebocoran PII)
    console.error('ErrorBoundary tertangkap:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, pesanError: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border p-8 rounded-lg text-center shadow-sm">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Sistem Mengalami Kendala
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Kami mendeteksi kendala saat memproses tampilan grafis. Data riwayat formulir lokal Anda tetap tersimpan dengan aman.
            </p>
            <div className="bg-muted p-3 rounded font-mono text-xs text-muted-foreground mb-6 text-left overflow-x-auto border border-border/50">
              <code>{this.state.pesanError}</code>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary-hover transition-colors active:translate-y-[1px]"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
