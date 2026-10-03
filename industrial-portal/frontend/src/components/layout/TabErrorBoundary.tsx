import React, { ErrorInfo, ReactNode } from 'react';

interface TabErrorBoundaryProps {
  children: ReactNode;
}

interface TabErrorBoundaryState {
  error: Error | null;
  generation: number;
}

export class TabErrorBoundary extends React.Component<
  TabErrorBoundaryProps,
  TabErrorBoundaryState
> {
  state: TabErrorBoundaryState = { error: null, generation: 0 };

  static getDerivedStateFromError(error: Error): Partial<TabErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Tab content render failed:', error, errorInfo);
  }

  private reloadSection = (): void => {
    this.setState((state) => ({
      error: null,
      generation: state.generation + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="rounded border border-[#7f1d1d] bg-[#450a0a]/70 p-6 text-center"
        >
          <h2 className="text-sm font-bold text-red-200">This section could not be displayed.</h2>
          <p className="mt-2 text-xs text-red-200/80">
            Reload the section to try again. Other portal sections remain available.
          </p>
          <button
            type="button"
            onClick={this.reloadSection}
            className="mt-4 rounded bg-[#dc2626] px-3 py-2 text-xs font-semibold text-white hover:bg-[#b91c1c]"
          >
            Reload section
          </button>
        </div>
      );
    }

    return <React.Fragment key={this.state.generation}>{this.props.children}</React.Fragment>;
  }
}
