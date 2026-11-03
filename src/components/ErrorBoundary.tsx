import { Component, type ErrorInfo, type ReactNode } from "react";

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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="wrap" style={{ minHeight: "60vh", display: "grid", placeContent: "center", textAlign: "center", padding: "40px 16px" }}>
          <div className="card" style={{ maxWidth: "560px", margin: "0 auto", padding: "36px 24px" }}>
            <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>⚠️</span>
            <h1 style={{ font: "700 24px var(--display)", textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 10px 0" }}>
              Pitwall System Advisory
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: "1.5", margin: "0 0 24px 0" }}>
              An unexpected telemetry interruption occurred while rendering this session.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: "var(--surface-2)",
                  color: "var(--fg)",
                  padding: "12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  overflowX: "auto",
                  textAlign: "left",
                  margin: "0 0 24px 0",
                  border: "1px solid var(--line)",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="nav-btn active"
                onClick={this.handleReload}
                style={{ cursor: "pointer", border: "none" }}
              >
                🔄 Refresh Pitwall
              </button>
              <button
                type="button"
                className="nav-btn"
                onClick={this.handleHome}
                style={{ cursor: "pointer", border: "1px solid var(--line)" }}
              >
                🏁 Return to Race Schedule
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
