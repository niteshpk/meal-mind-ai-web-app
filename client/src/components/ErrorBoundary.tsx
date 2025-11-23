import React, { Component, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertTriangle } from "lucide-react";

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service in production
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mb-4">
                  We're sorry, but something unexpected happened. Please try
                  again.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      Error details
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
              <Button onClick={this.handleReset} className="w-full">
                Go to Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

