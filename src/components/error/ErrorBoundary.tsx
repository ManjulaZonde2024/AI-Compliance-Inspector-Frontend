import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-bg p-6">
          <Card className="max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Application error
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              The inspection workspace could not continue. Please reload the app and
              try again.
            </p>
            <Button className="mt-5" onClick={this.handleRetry}>
              Reload workspace
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
