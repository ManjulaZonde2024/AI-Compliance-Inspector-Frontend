import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageManager } from '../components/inspection/ImageManager'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { inspectionService } from '../services'
import { productCategories, type CreateInspectionInput, type ProductCategory } from '../types'

type FormErrors = Partial<Record<'productName' | 'category' | 'images', string>>
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

const initialForm: CreateInspectionInput = {
  productName: '',
  category: '',
  brand: '',
  sku: '',
  notes: '',
  images: [],
}

export function NewInspectionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateInspectionInput>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [createdId, setCreatedId] = useState<string | null>(null)

  useEffect(() => {
    if (submissionState !== 'success' || !createdId) return
    const timeout = window.setTimeout(() => navigate(`/inspections/${createdId}/scan`, { state: { productName: form.productName, category: form.category, images: form.images.map((image) => ({ previewUrl: image.previewUrl, role: image.role })) } }), 450)
    return () => window.clearTimeout(timeout)
  }, [createdId, form.category, form.images, form.productName, navigate, submissionState])

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!form.productName.trim()) nextErrors.productName = 'Enter the product name to continue.'
    if (!form.category) nextErrors.category = 'Select a product category.'
    if (form.images.length === 0) nextErrors.images = 'Upload at least one label image to begin an inspection.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submissionState === 'submitting' || !validate()) return
    setSubmissionState('submitting')
    inspectionService.createInspection(form).then(
      ({ inspectionId }) => { setCreatedId(inspectionId); setSubmissionState('success') },
      () => setSubmissionState('error'),
    )
  }

  return <>
    <PageHeader title="New inspection" description="Enter product details and upload clear label images to begin the inspection." actions={<Badge tone="info">Inspection intake</Badge>} />
    <form onSubmit={submit} noValidate className="space-y-6">
      {submissionState === 'error' ? <div className="rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">The inspection could not be created. Please try again.</div> : null}
      {submissionState === 'success' ? <div className="rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success" role="status">Inspection created. Opening the scan workspace…</div> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card title="Product information" description="Use the product details shown on the packaging. Fields marked * are required." className="h-fit">
          <div className="grid gap-5">
            <div><Input label="Product name *" placeholder="e.g. Calm Restore Night Cream" value={form.productName} error={errors.productName} onChange={(event) => { setForm({ ...form, productName: event.target.value }); setErrors({ ...errors, productName: undefined }) }} /></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="category" className="text-sm font-medium text-ink">Category *</label><select id="category" value={form.category} aria-invalid={errors.category ? true : undefined} aria-describedby={errors.category ? 'category-error' : 'category-help'} onChange={(event) => { setForm({ ...form, category: event.target.value as ProductCategory }); setErrors({ ...errors, category: undefined }) }} className={`h-10 rounded-md border bg-surface px-3 text-sm text-ink transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${errors.category ? 'border-danger' : 'border-border'}`}><option value="">Select a category</option>{productCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select><p id="category-help" className="text-xs text-muted">Choose the closest product category for this intake.</p>{errors.category ? <p id="category-error" className="text-sm text-danger">{errors.category}</p> : null}</div>
            <div className="grid gap-5 sm:grid-cols-2"><Input label="Brand or manufacturer" placeholder="Optional" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} /><Input label="Product identifier / SKU" placeholder="Optional" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></div>
            <div className="flex flex-col gap-1.5"><label htmlFor="notes" className="text-sm font-medium text-ink">Notes or description <span className="font-normal text-muted">(optional)</span></label><textarea id="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add useful context for the reviewer, such as a product variant or packaging detail." rows={5} className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" /><p className="text-xs text-muted">Do not include sensitive customer or account information.</p></div>
          </div>
        </Card>
        <Card title="Product images" description="Add clear package and label images. You can set a view label and review order after uploading.">
          <ImageManager images={form.images} error={errors.images} onChange={(images) => { setForm({ ...form, images }); if (images.length) setErrors({ ...errors, images: undefined }) }} />
        </Card>
        <Card title="Inspection readiness" description="Review the current intake before starting the inspection." className="h-fit xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-4">
            <div><p className="text-xs uppercase tracking-wide text-muted">Product</p><p className="mt-1 truncate font-medium text-ink">{form.productName.trim() || 'Not entered'}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted">Category</p><p className="mt-1 truncate font-medium text-ink">{form.category || 'Not selected'}</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted">Images</p><p className="mt-1 font-medium text-ink">{form.images.length} attached</p></div>
            <div><p className="text-xs uppercase tracking-wide text-muted">Readiness</p><Badge className="mt-1" tone={form.productName.trim() && form.category && form.images.length ? 'success' : 'warning'}>{form.productName.trim() && form.category && form.images.length ? 'Ready to start' : 'Needs details'}</Badge></div>
          </div>
        </Card>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">Confirm the product details and label images before starting.</p><Button type="submit" disabled={submissionState === 'submitting' || submissionState === 'success'}>{submissionState === 'submitting' ? 'Starting inspection…' : submissionState === 'success' ? 'Opening scan…' : 'Start inspection'} <span aria-hidden>→</span></Button></div>
    </form>
  </>
}
