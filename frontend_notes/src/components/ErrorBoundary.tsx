import React, { Component, ReactNode } from "react";
import { ErrorMessage } from "./ErrorMessage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para mostrar la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Podés loguear el error en un servicio externo como Sentry
    console.error("ErrorBoundary atrapó un error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <ErrorMessage
            title="Unexpected Error"
            message={this.state.error?.message || "Something went wrong."}
            dismissible
            onDismiss={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
