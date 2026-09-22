import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { maxFileSize, supportedTypes } from './imageFileLimits'
import type { InspectionImageInput, InspectionImageRole } from '../../types'

type ImageSource = 'camera' | 'photos' | 'ecommerce'
type ImageManagerProps = {
  /**
   * `full` = the New Inspection physical-image section (camera first).
   * `compact` = the original dropzone treatment. Handling is identical.
   */
  mode?: 'full' | 'compact'
  images: InspectionImageInput[]
  onChange: (images: InspectionImageInput[]) => void
  error?: string
  /** Reports which picker was opened so guidance can follow the source. */
  onSourcePick?: (source: ImageSource) => void
}

function readableSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ImageManager({ mode = 'compact', images, onChange, error, onSourcePick }: ImageManagerProps) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const replaceIndexRef = useRef<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  /** Anchor rect of the primary action while the source-choice sheet/menu is open. */
  const [choiceRect, setChoiceRect] = useState<DOMRect | null>(null)

  const addFiles = (files: FileList | File[]) => {
    const selected = Array.from(files)
    const invalid = selected.find((file) => !supportedTypes.includes(file.type) || file.size > maxFileSize)
    if (invalid) {
      setFileError(!supportedTypes.includes(invalid.type) ? `${invalid.name} is not a supported image format.` : `${invalid.name} exceeds the 10 MB file-size limit.`)
      return
    }
    setFileError(null)
    setIsProcessing(true)
    window.setTimeout(() => {
      const nextImages = selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file), role: 'front' as const }))
      const replaceIndex = replaceIndexRef.current
      if (replaceIndex !== null) {
        URL.revokeObjectURL(images[replaceIndex].previewUrl)
        onChange(images.map((image, index) => index === replaceIndex ? { ...nextImages[0], role: image.role } : image))
        replaceIndexRef.current = null
      } else {
        onChange([...images, ...nextImages])
      }
      setIsProcessing(false)
    }, 250)
  }

  const onPickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) addFiles(event.target.files)
    event.target.value = ''
  }

  const openPicker = (replaceIndex?: number) => {
    replaceIndexRef.current = replaceIndex ?? null
    pickerRef.current?.click()
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl)
    onChange(images.filter((_, imageIndex) => imageIndex !== index))
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const openCamera = () => {
    onSourcePick?.('camera')
    cameraRef.current?.click()
  }

  const openGallery = () => {
    onSourcePick?.('photos')
    galleryRef.current?.click()
  }

  const openFiles = () => {
    onSourcePick?.('photos')
    openPicker()
  }

  /* Google-Lens-style source choice — one primary action reveals the three
     real browser inputs (camera capture / gallery / files). No fake camera. */
  const openChoice = (event: ReactMouseEvent<HTMLButtonElement>) => setChoiceRect(event.currentTarget.getBoundingClientRect())
  const closeChoice = () => setChoiceRect(null)
  const pickAndClose = (action: () => void) => { closeChoice(); action() }

  useEffect(() => {
    if (!choiceRect) return undefined
    const onKeyDown = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') closeChoice() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [choiceRect])

  const optionClass = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand'
  const choiceItems = (
    <>
      <button type="button" role="menuitem" onClick={() => pickAndClose(openCamera)} className={optionClass}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.2l.9-1.5h4.8L11.3 4h1.2A1.5 1.5 0 0 1 14 5.5v5A1.5 1.5 0 0 1 12.5 12h-9A1.5 1.5 0 0 1 2 10.5v-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.3" /></svg>
        </span>
        Take photo
      </button>
      <button type="button" role="menuitem" onClick={() => pickAndClose(openGallery)} className={optionClass}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><circle cx="5.6" cy="6.4" r="1.1" stroke="currentColor" strokeWidth="1.2" /><path d="m3.2 11.5 3.1-3 2.3 2.2 2.4-2.4 1.8 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        Choose from photos
      </button>
      <button type="button" role="menuitem" onClick={() => pickAndClose(openFiles)} className={optionClass}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2.5h5l3 3v8H4v-11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M9 2.5v3h3M6 9h4M6 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </span>
        Choose files
      </button>
    </>
  )

  const previewGrid = images.length > 0 ? (
    <div className="mt-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4" aria-label="Selected product images">
        {images.map((image, index) => (
          <li key={image.previewUrl} className="finding-enter overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="relative">
              <img className="h-16 w-full object-cover sm:h-20" src={image.previewUrl} alt={`Preview of ${image.file.name}`} title={`${image.file.name} · ${readableSize(image.file.size)}`} />
              {/* Source/view indication directly on the thumbnail. */}
              <span className="absolute left-1 top-1 rounded bg-ink/75 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">{image.role}</span>
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove ${image.file.name}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs font-bold text-white transition-colors hover:bg-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-1 p-1.5">
              <label className="min-w-0 flex-1 text-[10px] font-medium text-muted">
                <span className="sr-only">Image view for {image.file.name}</span>
                <select
                  value={image.role}
                  aria-label={`View for ${image.file.name}`}
                  onChange={(event) => onChange(images.map((current, currentIndex) => currentIndex === index ? { ...current, role: event.target.value as InspectionImageRole } : current))}
                  className="block h-6 w-full rounded border border-border bg-surface px-1 text-[11px] text-ink focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <option value="front">Front</option>
                  <option value="back">Back</option>
                  <option value="side">Side</option>
                  <option value="label">Label</option>
                </select>
              </label>
              <button type="button" onClick={() => openPicker(index)} aria-label={`Replace ${image.file.name}`} title="Replace" className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface text-[11px] text-muted transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand">↻</button>
              <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label={`Move ${image.file.name} earlier`} title="Move earlier" className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface text-[11px] text-muted transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40">←</button>
              <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label={`Move ${image.file.name} later`} title="Move later" className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-surface text-[11px] text-muted transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40">→</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <Badge tone="info">{images.length} image{images.length === 1 ? '' : 's'} added</Badge>
        <span>Arrows set review order.</span>
      </div>
    </div>
  ) : null

  return <div>
    <input ref={pickerRef} className="sr-only" type="file" accept={supportedTypes.join(',')} multiple onChange={onPickerChange} aria-label="Select product images" />
    {/* Browser-native camera capture — same file pipeline, no extra service. */}
    <input ref={cameraRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={onPickerChange} aria-label="Take a photo with the camera" />
    <input ref={galleryRef} className="sr-only" type="file" accept={supportedTypes.join(',')} multiple onChange={onPickerChange} aria-label="Choose photos from your gallery" />

    {mode === 'full' ? (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">Physical evidence</p>
        <div
          className={`mt-2 rounded-lg border border-dashed px-3 py-2.5 transition-colors ${isDragging ? 'border-brand bg-brand-light' : error || fileError ? 'border-danger/60 bg-danger/5' : 'border-border bg-bg/60 hover:border-brand/50 hover:bg-brand-light/40'}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files) }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button className="cta-grad" onClick={openChoice} aria-haspopup="menu" aria-expanded={choiceRect !== null}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.2l.9-1.5h4.8L11.3 4h1.2A1.5 1.5 0 0 1 14 5.5v5A1.5 1.5 0 0 1 12.5 12h-9A1.5 1.5 0 0 1 2 10.5v-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.3" /></svg>
              Camera / Add photo
            </Button>
            <Button variant="secondary" size="sm" onClick={openGallery}>Photos</Button>
            <Button variant="secondary" size="sm" onClick={openFiles}>Files</Button>
          </div>
          <p className="mt-2 text-xs text-muted">{isDragging ? 'Drop images to add them' : 'JPG, PNG or WEBP · 10 MB max'}</p>
        </div>
        {choiceRect ? createPortal(
          <>
            <div className="fixed inset-0 z-40 bg-ink/45 sm:bg-ink/15" onClick={closeChoice} aria-hidden />
            {/* Mobile — bottom action sheet. */}
            <div role="menu" aria-label="Add a photo" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-2 pb-3 shadow-2xl sm:hidden">
              <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Add a photo</p>
              {choiceItems}
            </div>
            {/* Desktop — compact popover anchored below the primary action. */}
            <div
              role="menu"
              aria-label="Add a photo"
              className="fixed z-50 hidden w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl sm:block"
              style={{
                top: choiceRect.bottom + 210 > window.innerHeight ? Math.max(8, choiceRect.top - 210) : choiceRect.bottom + 8,
                left: Math.min(Math.max(8, choiceRect.left), Math.max(8, window.innerWidth - 240)),
              }}
            >
              {choiceItems}
            </div>
          </>,
          document.body,
        ) : null}
      </div>
    ) : (
      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragging ? 'border-brand bg-brand-light shadow-sm' : error || fileError ? 'border-danger/60 bg-danger/5' : 'border-border bg-bg/60 hover:border-brand/50 hover:bg-brand-light/40'}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files) }}
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-brand shadow-sm" aria-hidden>↑</div>
        <p className="mt-3 text-sm font-semibold text-ink">{isDragging ? 'Drop images to add them' : 'Drag and drop label images here'}</p>
        <p className="mt-1 text-sm text-muted">JPG, PNG or WEBP · Maximum 10 MB per image</p>
        <Button className="mt-4" variant="secondary" size="sm" onClick={() => openPicker()}>Choose images</Button>
      </div>
    )}
    {isProcessing ? <div className="mt-3 flex items-center gap-2 text-sm text-muted" role="status"><span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden />Preparing image previews…</div> : null}
    {fileError ? <p className="mt-3 text-sm text-danger" role="alert">{fileError}</p> : null}
    {error ? <p className="mt-3 text-sm text-danger" role="alert">{error}</p> : null}
    {mode !== 'full' && images.length === 0 && !isProcessing ? <p className="mt-4 text-sm text-muted">Add clear images of the product and label. You can identify each view after upload.</p> : null}
    {previewGrid}
  </div>
}
