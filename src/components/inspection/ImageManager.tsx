import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { InspectionImageInput, InspectionImageRole } from '../../types'

const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxFileSize = 10 * 1024 * 1024
type ImageManagerProps = {
  images: InspectionImageInput[]
  onChange: (images: InspectionImageInput[]) => void
  error?: string
}

function readableSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ImageManager({ images, onChange, error }: ImageManagerProps) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const replaceIndexRef = useRef<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

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

  return <div>
    <input ref={pickerRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPickerChange} aria-label="Select product images" />
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
    {isProcessing ? <div className="mt-3 flex items-center gap-2 text-sm text-muted" role="status"><span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden />Preparing image previews…</div> : null}
    {fileError ? <p className="mt-3 text-sm text-danger" role="alert">{fileError}</p> : null}
    {error ? <p className="mt-3 text-sm text-danger" role="alert">{error}</p> : null}
    {images.length === 0 && !isProcessing ? <p className="mt-4 text-sm text-muted">Add clear images of the product and label. You can identify each view after upload.</p> : null}
    {images.length > 0 ? <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Selected product images">
      {images.map((image, index) => <li key={image.previewUrl} className="finding-enter overflow-hidden rounded-lg border border-border bg-surface shadow-sm" style={{ animationDelay: `${index * 60}ms` }}>
        <img className="h-40 w-full object-cover" src={image.previewUrl} alt={`Preview of ${image.file.name}`} />
        <div className="space-y-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink" title={image.file.name}>{image.file.name}</p><p className="mt-0.5 text-xs text-muted">{readableSize(image.file.size)}</p></div>
          <label className="block text-xs font-medium text-muted">Image view<select value={image.role} onChange={(event) => onChange(images.map((current, currentIndex) => currentIndex === index ? { ...current, role: event.target.value as InspectionImageRole } : current))} className="mt-1 block h-8 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brand"><option value="front">Front</option><option value="back">Back</option><option value="side">Side</option><option value="label">Label</option></select></label>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => openPicker(index)}>Replace</Button><Button size="sm" variant="ghost" disabled={index === 0} aria-label={`Move ${image.file.name} earlier`} onClick={() => moveImage(index, -1)}>←</Button><Button size="sm" variant="ghost" disabled={index === images.length - 1} aria-label={`Move ${image.file.name} later`} onClick={() => moveImage(index, 1)}>→</Button><Button size="sm" variant="ghost" className="text-danger hover:bg-danger/5" onClick={() => removeImage(index)}>Remove</Button></div>
        </div>
      </li>)}
    </ul> : null}
    {images.length > 0 ? <div className="mt-3 flex items-center gap-2 text-xs text-muted"><Badge tone="info">{images.length} image{images.length === 1 ? '' : 's'} added</Badge><span>Use the arrows to set review order.</span></div> : null}
  </div>
}
