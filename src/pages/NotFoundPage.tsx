import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Inspection route not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The page you tried to open is not available in this inspection workspace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Link to="/dashboard">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-brand"
            >
              Return to dashboard
            </button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
