import { useRef, useState, type DragEvent as ReactDragEvent, type FormEvent, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react'
import irrelevantExample from '../assets/hero.png'
import { ImageManager } from '../components/inspection/ImageManager'
import { InspectionScanSession } from '../components/inspection/InspectionScanSession'
import { maxFileSize, supportedTypes } from '../components/inspection/imageFileLimits'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Reveal } from '../components/ui/Reveal'
import { inspectionService } from '../services'
import { productCategories, type CreateInspectionInput, type ProductCategory, type ScanInspectionContext } from '../types'
import { cn } from '../utils/cn'

type FormErrors = Partial<Record<'productName' | 'category' | 'images' | 'barcodeWidth' | 'barcodeHeight', string>>
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'
/** Phase 1 = setup on this page, phase 2 = the real scan running on this page, then navigation to Result. */
type Phase = 'setup' | 'scan'
type GuidanceSource = 'camera' | 'photos' | 'ecommerce'
type ListingImage = { file: File; previewUrl: string }
type GuidanceExample = {
  kind: 'do' | 'dont'
  title: string
  caption: string
  /** Optional example photo — falls back to the built-in treatment when absent or blocked. */
  image?: string
  treatment?: 'crop' | 'glare' | 'blur'
}

const initialForm: CreateInspectionInput = {
  productName: '',
  category: '',
  brand: '',
  sku: '',
  notes: '',
  images: [],
}

/* Realistic example imagery reuses the product/label photos already used by the
   project's own result data. No new assets are downloaded; if a photo fails to
   load, the slide degrades to its built-in visual treatment. */
const examplePackagePhoto = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85'
const exampleLabelPhoto = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85'

const sourceTabs: { id: GuidanceSource; label: string }[] = [
  { id: 'camera', label: 'Camera' },
  { id: 'photos', label: 'Photos' },
  { id: 'ecommerce', label: 'E-commerce' },
]

/** Source-aware do / don't examples — each slide = one image, one short title, one line. */
const guidanceExamples: Record<GuidanceSource, GuidanceExample[]> = {
  camera: [
    { kind: 'do', title: 'Complete package', caption: 'Keep the whole pack inside the frame.', image: examplePackagePhoto },
    { kind: 'do', title: 'Label readable', caption: 'Text sharp enough to zoom in on.', image: exampleLabelPhoto },
    { kind: 'do', title: 'Good lighting', caption: 'Even light across the front of the pack.', image: examplePackagePhoto },
    { kind: 'dont', title: 'Cropped product', caption: 'Cut edges hide label details.', image: examplePackagePhoto, treatment: 'crop' },
    { kind: 'dont', title: 'Glare on label', caption: 'Reflections erase printed text.', image: exampleLabelPhoto, treatment: 'glare' },
    { kind: 'dont', title: 'Blurry shot', caption: 'Blur hides the fine print.', image: examplePackagePhoto, treatment: 'blur' },
  ],
  photos: [
    { kind: 'do', title: 'Clear existing photo', caption: 'Pick a picture that is already sharp.', image: exampleLabelPhoto },
    { kind: 'do', title: 'Complete packaging', caption: 'Full pack visible from edge to edge.', image: examplePackagePhoto },
    { kind: 'do', title: 'Readable label', caption: 'Print stays legible at full size.', image: exampleLabelPhoto },
    { kind: 'dont', title: 'Compressed image', caption: 'Low quality hides label text.', image: examplePackagePhoto, treatment: 'blur' },
    { kind: 'dont', title: 'Cropped packaging', caption: 'Only part of the pack is shown.', image: examplePackagePhoto, treatment: 'crop' },
    { kind: 'dont', title: 'Irrelevant image', caption: 'A picture of something else.', image: irrelevantExample },
  ],
  ecommerce: [
    { kind: 'do', title: 'Readable listing', caption: 'Name, price and label all legible.', image: examplePackagePhoto },
    { kind: 'do', title: 'Useful screenshot', caption: 'The whole product page in one shot.', image: exampleLabelPhoto },
    { kind: 'do', title: 'Matching details', caption: 'Listing information matches the pack.', image: examplePackagePhoto },
    { kind: 'dont', title: 'Tiny screenshot', caption: 'Zoomed-out text cannot be checked.', image: exampleLabelPhoto, treatment: 'blur' },
    { kind: 'dont', title: 'Cropped information', caption: 'Key details cut off the screen.', image: examplePackagePhoto, treatment: 'crop' },
    { kind: 'dont', title: 'Unrelated content', caption: 'A screen that is not this product.', image: irrelevantExample },
  ],
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="m2.5 6.3 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3.2 3.2l5.6 5.6M8.8 3.2 3.2 8.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d={direction === 'left' ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PackageGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5v-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m4 7.5 8 3.6 8-3.6M12 11.1V20" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function GuidanceExampleCard({ example }: { example: GuidanceExample }) {
  const isDo = example.kind === 'do'
  const mediaClass = cn(
    'absolute inset-0 h-full w-full object-cover',
    example.treatment === 'crop' && 'origin-top-right scale-[1.6]',
    example.treatment === 'blur' && 'scale-105 blur-[3px]',
    !example.treatment && 'transition-transform duration-300 group-hover:scale-[1.05]',
  )

  /* Compact premium guidance card: image · DO/DON'T badge · title · one line. */
  return (
    <figure
      className={cn(
        'group flex overflow-hidden rounded-xl border bg-surface transition-colors duration-200',
        isDo ? 'border-success/25 hover:border-success/50' : 'border-danger/25 hover:border-danger/50',
      )}
    >
      <div className={cn('relative h-20 w-28 shrink-0 overflow-hidden sm:h-[5.5rem] sm:w-40', isDo ? 'border-r border-success/25' : 'border-r border-danger/25')}>
        {/* Visual treatment shown underneath — becomes the slide if no photo is available. */}
        <div className={cn('absolute inset-0 flex items-center justify-center', isDo ? 'bg-gradient-to-br from-success/10 to-surface-soft' : 'bg-gradient-to-br from-danger/10 to-surface-soft')} aria-hidden>
          <span className={isDo ? 'text-success' : 'text-danger'}><PackageGlyph /></span>
        </div>
        {example.image ? (
          <img
            src={example.image}
            alt=""
            loading="lazy"
            onError={(event) => { event.currentTarget.style.display = 'none' }}
            className={mediaClass}
          />
        ) : null}
        {example.treatment === 'glare' ? (
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_28%_22%,rgb(255_255_255/0.92),rgb(255_255_255/0)_65%)]" aria-hidden />
        ) : null}
      </div>
      <figcaption className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2">
        <span className={cn('inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]', isDo ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
          {isDo ? <CheckIcon /> : <CrossIcon />} {isDo ? 'Do' : "Don't"}
        </span>
        <p className="truncate text-[13px] font-semibold text-ink">{example.title}</p>
        <p className="line-clamp-2 text-xs leading-4 text-muted">{example.caption}</p>
      </figcaption>
    </figure>
  )
}

function GuidanceCarousel({ source, slide, onSlideChange, onSourceChange }: { source: GuidanceSource; slide: number; onSlideChange: (slide: number) => void; onSourceChange: (source: GuidanceSource) => void }) {
  const touchStartX = useRef<number | null>(null)
  const examples = guidanceExamples[source]
  const lastIndex = examples.length - 1
  const sourceLabel = sourceTabs.find((tab) => tab.id === source)?.label ?? ''

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX
  }
  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    onSlideChange(delta < 0 ? Math.min(slide + 1, lastIndex) : Math.max(slide - 1, 0))
  }

  const controlClass = 'flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted shadow-sm transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-px hover:border-brand/40 hover:text-ink hover:shadow-md active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex gap-0.5 rounded-lg border border-border bg-surface-soft p-0.5" role="group" aria-label="Guidance source">
          {sourceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={source === tab.id}
              onClick={() => onSourceChange(tab.id)}
              className={`rounded-md px-2 py-1 text-[12px] font-semibold transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${source === tab.id ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-surface hover:text-ink'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-muted">{slide + 1}/{examples.length} · {sourceLabel}</span>
          <div className="flex items-center gap-1" role="group" aria-label="Guidance examples">
            {examples.map((example, index) => (
              <button
                key={`${example.title}-${index}`}
                type="button"
                onClick={() => onSlideChange(index)}
                aria-label={`Show example ${index + 1}: ${example.title}`}
                aria-current={slide === index}
                className={`h-1.5 rounded-full transition-[width,background-color,background-image] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${slide === index ? 'w-4 grad-soft' : 'w-1.5 bg-border-strong hover:bg-muted'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className={controlClass} onClick={() => onSlideChange(Math.max(slide - 1, 0))} disabled={slide === 0} aria-label="Previous example"><ChevronIcon direction="left" /></button>
            <button type="button" className={controlClass} onClick={() => onSlideChange(Math.min(slide + 1, lastIndex))} disabled={slide === lastIndex} aria-label="Next example"><ChevronIcon direction="right" /></button>
          </div>
        </div>
      </div>

      <div
        className="mt-2 touch-pan-y overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${sourceLabel} image examples`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="carousel-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {examples.map((example, index) => (
            <div key={`${example.title}-${index}`} className="min-w-full shrink-0 px-0.5" aria-hidden={index !== slide}>
              <GuidanceExampleCard example={example} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ListingGallery({ images, onAdd, onRemove }: { images: ListingImage[]; onAdd: (files: FileList | File[]) => void; onRemove: (index: number) => void }) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      className={`rounded-lg border border-dashed px-2.5 py-2 transition-colors ${isDragging ? 'border-brand bg-brand-light' : 'border-border bg-surface/70 hover:border-brand/50 hover:bg-brand-light/30'}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event: ReactDragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); onAdd(event.dataTransfer.files) }}
    >
      <input ref={pickerRef} className="sr-only" type="file" accept={supportedTypes.join(',')} multiple onChange={(event) => { if (event.target.files?.length) onAdd(event.target.files); event.target.value = '' }} aria-label="Select e-commerce listing images" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{isDragging ? 'Drop listing screenshots to add them' : 'Screenshots or listing files'}</p>
        <Button size="sm" variant="secondary" onClick={() => pickerRef.current?.click()}>Add listing / screenshot</Button>
      </div>
      {images.length > 0 ? (
        <>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="E-commerce listing images">
            {images.map((image, index) => (
              <li key={image.previewUrl} className="finding-enter relative overflow-hidden rounded-md border border-border bg-surface shadow-sm" style={{ animationDelay: `${index * 50}ms` }}>
                <img className="h-16 w-24 object-cover" src={image.previewUrl} alt={`Preview of ${image.file.name}`} title={image.file.name} />
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${image.file.name}`}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs font-bold text-white transition-colors hover:bg-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[11px] text-muted">{images.length} listing image{images.length === 1 ? '' : 's'}</p>
        </>
      ) : null}
    </div>
  )
}

function ReadyChip({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors duration-200', ok ? 'border-success/25 bg-success/10 text-success' : 'border-border bg-surface-soft text-muted')}>
      <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-success' : 'bg-border-strong')} aria-hidden />
      {children}
    </span>
  )
}

export function NewInspectionPage() {
  const [form, setForm] = useState<CreateInspectionInput>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle')
  const [phase, setPhase] = useState<Phase>('setup')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [scanContext, setScanContext] = useState<ScanInspectionContext | null>(null)
  const [knowBarcodeWidth, setKnowBarcodeWidth] = useState(false)
  const [knowBarcodeHeight, setKnowBarcodeHeight] = useState(false)
  const [barcodeWidthText, setBarcodeWidthText] = useState('')
  const [barcodeHeightText, setBarcodeHeightText] = useState('')
  const [guidanceSource, setGuidanceSource] = useState<GuidanceSource>('camera')
  const [guidanceSlide, setGuidanceSlide] = useState(0)
  const [listingImages, setListingImages] = useState<ListingImage[]>([])
  const [listingError, setListingError] = useState<string | null>(null)

  const barcodeUnknown = !knowBarcodeWidth && !knowBarcodeHeight

  const clearBarcodeDimensions = () => {
    setKnowBarcodeWidth(false)
    setKnowBarcodeHeight(false)
    setBarcodeWidthText('')
    setBarcodeHeightText('')
    setErrors((prev) => ({ ...prev, barcodeWidth: undefined, barcodeHeight: undefined }))
  }

  const parseDimension = (value: string) => {
    if (value.trim() === '') return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return NaN
    return parsed
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!form.productName.trim()) nextErrors.productName = 'Enter the product name to continue.'
    if (!form.category) nextErrors.category = 'Select a product category.'
    // Ready with at least ONE source: a physical image OR an e-commerce image.
    if (form.images.length === 0 && listingImages.length === 0) nextErrors.images = 'Add at least one product image to continue.'
    const widthValue = knowBarcodeWidth ? parseDimension(barcodeWidthText) : undefined
    if (widthValue !== undefined && Number.isNaN(widthValue)) nextErrors.barcodeWidth = 'Enter a valid barcode width in mm (a number greater than 0).'
    const heightValue = knowBarcodeHeight ? parseDimension(barcodeHeightText) : undefined
    if (heightValue !== undefined && Number.isNaN(heightValue)) nextErrors.barcodeHeight = 'Enter a valid barcode height in mm (a number greater than 0).'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submissionState === 'submitting' || submissionState === 'success' || !validate()) return
    setSubmissionState('submitting')
    const intake: CreateInspectionInput = {
      ...form,
      // E-commerce screenshots ride along on the same existing image model.
      images: [...form.images, ...listingImages.map((image) => ({ file: image.file, previewUrl: image.previewUrl, role: 'front' as const }))],
    }
    const width = knowBarcodeWidth ? parseDimension(barcodeWidthText) : undefined
    const height = knowBarcodeHeight ? parseDimension(barcodeHeightText) : undefined
    if (width !== undefined && !Number.isNaN(width)) intake.barcodeWidthMm = width
    if (height !== undefined && !Number.isNaN(height)) intake.barcodeHeightMm = height
    inspectionService.createInspection(intake).then(
      ({ inspectionId }) => {
        // Existing intake logic is unchanged; only the presentation differs:
        // instead of routing away, this page switches to its scan phase.
        setCreatedId(inspectionId)
        setSubmissionState('success')
        setScanContext({
          productName: intake.productName,
          category: intake.category,
          images: intake.images.map((image) => ({ previewUrl: image.previewUrl, role: image.role })),
        })
        setPhase('scan')
        window.scrollTo({ top: 0 })
      },
      () => setSubmissionState('error'),
    )
  }

  const selectGuidanceSource = (source: GuidanceSource) => {
    setGuidanceSource(source)
    setGuidanceSlide(0)
  }

  const updateImages = (images: CreateInspectionInput['images']) => {
    setForm({ ...form, images })
    if (images.length) setErrors({ ...errors, images: undefined })
  }

  const addListingFiles = (files: FileList | File[]) => {
    const selected = Array.from(files)
    const invalid = selected.find((file) => !supportedTypes.includes(file.type) || file.size > maxFileSize)
    if (invalid) {
      setListingError(!supportedTypes.includes(invalid.type) ? `${invalid.name} is not a supported image format.` : `${invalid.name} exceeds the 10 MB file-size limit.`)
      return
    }
    setListingError(null)
    setErrors((prev) => ({ ...prev, images: undefined }))
    setListingImages((prev) => [...prev, ...selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))])
    selectGuidanceSource('ecommerce')
  }

  const removeListingImage = (index: number) => {
    setListingImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, imageIndex) => imageIndex !== index)
    })
  }

  /* ---------- Phase 2: the existing scan experience, rendered in place ---------- */
  if (phase === 'scan' && createdId) {
    return (
      <div className="space-y-3">
        <div className="welcome-enter flex items-center gap-3 rounded-lg border border-success/25 bg-success/10 px-4 py-3" role="status">
          <span className="status-pop flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-xs font-semibold text-white" aria-hidden>✓</span>
          <p className="text-sm text-success"><span className="font-semibold">Inspection created.</span> Running the compliance scan on this page.</p>
        </div>
        <InspectionScanSession inspectionId={createdId} context={scanContext} />
      </div>
    )
  }

  const barcodeSummary = [
    knowBarcodeWidth && barcodeWidthText.trim() ? `Width ${barcodeWidthText.trim()} mm` : null,
    knowBarcodeHeight && barcodeHeightText.trim() ? `Height ${barcodeHeightText.trim()} mm` : null,
  ].filter(Boolean).join(' · ') || 'Optional'

  const notesSummary = form.notes.trim() ? `${form.notes.trim().length} characters` : 'Optional'
  const moreDetailsSummary = [barcodeSummary === 'Optional' ? null : barcodeSummary, notesSummary === 'Optional' ? null : notesSummary].filter(Boolean).join(' · ') || 'Optional'

  const detailsReady = Boolean(form.productName.trim() && form.category)
  const imagesReady = form.images.length > 0 || listingImages.length > 0
  const physicalCount = form.images.length
  const listingCount = listingImages.length
  const imagesSummary = !imagesReady
    ? 'Add at least one image'
    : physicalCount && listingCount
      ? `${physicalCount} physical · ${listingCount} listing`
      : physicalCount
        ? `${physicalCount} physical image${physicalCount === 1 ? '' : 's'}`
        : `${listingCount} listing image${listingCount === 1 ? '' : 's'}`

  const secondarySummaryClass = 'ml-auto shrink-0 text-xs font-normal text-muted'
  const summaryRowClass = 'flex flex-wrap cursor-pointer list-none items-center gap-x-3 gap-y-1 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden'
  const chevronClass = 'shrink-0 text-muted transition-transform duration-200 group-open:rotate-180'
  const fieldClass = `h-11 rounded-md border bg-surface px-3 text-[15px] text-ink transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${errors.category ? 'border-danger' : 'border-border'}`

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <header className="welcome-enter relative overflow-hidden border-b border-border pb-2.5">
        <span className="glow-orb -left-14 -top-16 h-36 w-36 [animation-delay:-6s]" aria-hidden />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">New inspection</h1>
        </div>
      </header>

      <form onSubmit={submit} noValidate className="space-y-2.5 sm:space-y-3">
        {submissionState === 'error' ? <div className="rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">The inspection could not be created. Please try again.</div> : null}

        <Reveal>
          <Card title="01 · Identify" dense>
            {/* Primary fields — visually dominant over the optional details below. */}
            <div className="grid gap-2.5 rounded-xl border border-brand/25 bg-gradient-to-br from-brand-light/70 to-surface-soft p-2.5 sm:grid-cols-2 sm:p-3">
              <Input label="Product name *" placeholder="e.g. Calm Restore Night Cream" className="h-11 text-[15px]" value={form.productName} error={errors.productName} onChange={(event) => { setForm({ ...form, productName: event.target.value }); setErrors({ ...errors, productName: undefined }) }} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-[13px] font-semibold text-ink">Category *</label>
                <select id="category" value={form.category} aria-invalid={errors.category ? true : undefined} aria-describedby={errors.category ? 'category-error' : undefined} onChange={(event) => { setForm({ ...form, category: event.target.value as ProductCategory }); setErrors({ ...errors, category: undefined }) }} className={fieldClass}>
                  <option value="">Select a category</option>
                  {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                {errors.category ? <p id="category-error" className="text-sm text-danger">{errors.category}</p> : null}
              </div>
            </div>

            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <Input label="Brand or manufacturer" placeholder="Optional" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
              <Input label="Product identifier / SKU" placeholder="Optional" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
            </div>

            <details className="group mt-2 rounded-lg border border-border bg-surface-soft/60 px-3 py-2 open:bg-surface-soft">
              <summary className={summaryRowClass}>
                Barcode, dimensions &amp; notes
                <span className={secondarySummaryClass}>{moreDetailsSummary}</span>
                <svg className={chevronClass} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="m4 6.2 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <div className="details-body mt-2 border-t border-border/70 pt-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Barcode physical dimensions <span className="font-normal normal-case tracking-normal">(optional)</span></p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={knowBarcodeWidth}
                        onChange={(event) => {
                          setKnowBarcodeWidth(event.target.checked)
                          if (!event.target.checked) {
                            setBarcodeWidthText('')
                            setErrors((prev) => ({ ...prev, barcodeWidth: undefined }))
                          }
                        }}
                        className="h-4 w-4 shrink-0 accent-brand"
                      />
                      I know the barcode width
                    </label>
                    <div className="mt-2 flex items-center gap-2 pl-[1.625rem]">
                      <label htmlFor="barcode-width" className="sr-only">Barcode width</label>
                      <input
                        id="barcode-width"
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="40"
                        value={barcodeWidthText}
                        disabled={!knowBarcodeWidth}
                        aria-invalid={errors.barcodeWidth ? true : undefined}
                        onChange={(event) => {
                          setBarcodeWidthText(event.target.value)
                          setErrors((prev) => ({ ...prev, barcodeWidth: undefined }))
                        }}
                        className={`h-10 w-24 rounded-md border bg-surface px-3 text-sm text-ink transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${errors.barcodeWidth ? 'border-danger' : 'border-border'}`}
                      />
                      <span className="text-sm text-muted">mm</span>
                    </div>
                    {errors.barcodeWidth ? <p className="mt-1 pl-[1.625rem] text-sm text-danger">{errors.barcodeWidth}</p> : null}
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={knowBarcodeHeight}
                        onChange={(event) => {
                          setKnowBarcodeHeight(event.target.checked)
                          if (!event.target.checked) {
                            setBarcodeHeightText('')
                            setErrors((prev) => ({ ...prev, barcodeHeight: undefined }))
                          }
                        }}
                        className="h-4 w-4 shrink-0 accent-brand"
                      />
                      I know the barcode height
                    </label>
                    <div className="mt-2 flex items-center gap-2 pl-[1.625rem]">
                      <label htmlFor="barcode-height" className="sr-only">Barcode height</label>
                      <input
                        id="barcode-height"
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        placeholder="15"
                        value={barcodeHeightText}
                        disabled={!knowBarcodeHeight}
                        aria-invalid={errors.barcodeHeight ? true : undefined}
                        onChange={(event) => {
                          setBarcodeHeightText(event.target.value)
                          setErrors((prev) => ({ ...prev, barcodeHeight: undefined }))
                        }}
                        className={`h-10 w-24 rounded-md border bg-surface px-3 text-sm text-ink transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${errors.barcodeHeight ? 'border-danger' : 'border-border'}`}
                      />
                      <span className="text-sm text-muted">mm</span>
                    </div>
                    {errors.barcodeHeight ? <p className="mt-1 pl-[1.625rem] text-sm text-danger">{errors.barcodeHeight}</p> : null}
                  </div>
                </div>
                <button
                  type="button"
                  aria-pressed={barcodeUnknown}
                  onClick={clearBarcodeDimensions}
                  className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-md text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span aria-hidden className={`flex h-4 w-4 items-center justify-center rounded-full border ${barcodeUnknown ? 'border-brand' : 'border-border-strong/60'}`}>
                    {barcodeUnknown ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                  </span>
                  I don&apos;t know
                </button>

                <div className="mt-3 flex flex-col gap-1.5 border-t border-border/70 pt-3">
                  <label htmlFor="notes" className="text-sm font-medium text-ink">Notes or description <span className="font-normal text-muted">(optional)</span></label>
                  <textarea id="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Product variant or packaging detail." rows={2} className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" />
                </div>
              </div>
            </details>
          </Card>
        </Reveal>

        <Reveal delay={40}>
          <Card title="02 · Capture" className="border-brand/25" dense>
            <div className="grid gap-2.5 lg:grid-cols-2">
              {/* Source 1 — physical product: camera first, then gallery/files. */}
              <section className="hover-lift relative overflow-hidden rounded-xl border border-border bg-surface-soft/60 p-2.5" aria-label="Physical product images">
                <span className="plum-accent grad-drift absolute inset-x-0 top-0 h-0.5" aria-hidden />
                <ImageManager
                  mode="full"
                  images={form.images}
                  error={errors.images}
                  onChange={updateImages}
                  onSourcePick={selectGuidanceSource}
                />
              </section>

              {/* Source 2 — e-commerce screenshots / listing files, never mixed. */}
              <section className="relative overflow-hidden rounded-xl border border-dashed border-brand/40 bg-brand-light/40 p-2.5" aria-label="E-commerce images">
                <span className="grad-lavender grad-drift absolute inset-x-0 top-0 h-0.5" aria-hidden />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">Digital listing evidence</p>
                  <span className="rounded-full border border-brand/30 bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand">Separate source</span>
                </div>
                <div className="mt-2">
                  <ListingGallery images={listingImages} onAdd={addListingFiles} onRemove={removeListingImage} />
                </div>
                {listingError ? <p className="mt-2 text-sm text-danger" role="alert">{listingError}</p> : null}
              </section>
            </div>

            {/* Do / Don't guidance — folded into the capture workspace so the
                page reads as one guided flow instead of stacked cards. */}
            <div className="mt-3 border-t border-border/60 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Do / Don&apos;t guidance</p>
              <div className="mt-2">
                <GuidanceCarousel
                  source={guidanceSource}
                  slide={guidanceSlide}
                  onSlideChange={setGuidanceSlide}
                  onSourceChange={selectGuidanceSource}
                />
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card title="03 · Review" dense>
            {/* Review strip — existing entered data only. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
              <span className="font-semibold text-ink">{form.productName.trim() || 'Product name pending'}</span>
              <span className="text-muted">{form.category || 'No category yet'}</span>
              {form.brand.trim() ? <span className="text-muted">{form.brand}</span> : null}
              {form.sku.trim() ? <span className="font-mono text-[12px] text-muted">{form.sku}</span> : null}
              <span className="tabular-nums text-muted">{imagesSummary}</span>
              <span className={cn('ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors duration-200', detailsReady && imagesReady ? 'border-success/25 bg-success/10 text-success' : 'border-border bg-surface-soft text-muted')}>
                <span className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-200', detailsReady && imagesReady ? 'bg-success' : 'bg-border-strong')} aria-hidden />
                {detailsReady && imagesReady ? 'Ready to inspect' : 'Details and one image required'}
              </span>
            </div>
          </Card>
        </Reveal>

        <div className="sticky bottom-2 z-20">
          <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-surface/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
            <span className="plum-accent grad-drift absolute inset-x-0 top-0 h-px" aria-hidden />
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <ReadyChip ok={detailsReady}>Details</ReadyChip>
              <ReadyChip ok={imagesReady}>{imagesSummary}</ReadyChip>
              {detailsReady && imagesReady ? <span className="text-[12px] font-semibold text-success">Ready to start</span> : null}
            </div>
            <Button type="submit" className="cta-grad shrink-0 shadow-lg" disabled={submissionState === 'submitting' || !detailsReady || !imagesReady}>
              {submissionState === 'submitting' ? 'Starting…' : 'Start inspection'} <span aria-hidden>→</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
