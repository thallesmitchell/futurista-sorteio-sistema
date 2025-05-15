
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
          <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro inesperado ao carregar o conteúdo.
            </p>
            {this.state.error && (
              <div className="bg-background/50 p-3 rounded mb-4 text-left overflow-auto max-h-40">
                <code className="text-xs">{this.state.error.toString()}</code>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="default"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
              <Button
                variant="outline"
                onClick={this.resetError}
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
