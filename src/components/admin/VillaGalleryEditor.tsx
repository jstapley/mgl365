'use client'

import { useState, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ImagePlus, Loader2, Upload } from 'lucide-react'

const MAX_IMAGES = 20

export default function VillaGalleryEditor({ initial }: { initial?: string[] }) {
  const [images, setImages] = useState<string[]>(
    (initial ?? []).filter(Boolean)
  )
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ name: string; status: 'uploading' | 'done' | 'error' }[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = useCallback(async (files: File[]) => {
    const allowed = files.filter(f => f.type.startsWith('image/'))
    const remaining = MAX_IMAGES - images.length
    const toUpload = allowed.slice(0, remaining)
    if (toUpload.length === 0) return

    setUploading(true)
    setProgress(toUpload.map(f => ({ name: f.name, status: 'uploading' })))

    const newUrls: string[] = []

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
        newUrls.push(data.url)
        setProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'done' } : x))
      } catch (err) {
        console.error('Upload failed:', err)
        setProgress(p => p.map((x, idx) => idx === i ? { ...x, status: 'error' } : x))
      }
    }

    setImages(prev => {
      const updated = [...prev, ...newUrls]
      if (newUrls.length > 0) setPreviewIndex(prev.length)
      return updated
    })
    setUploading(false)
    setTimeout(() => setProgress([]), 3000)
  }, [images.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (images.length >= MAX_IMAGES) return
    uploadFiles(Array.from(e.dataTransfer.files))
  }, [uploadFiles, images.length])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const removeImage = (i: number) => {
    setImages(prev => {
      const updated = prev.filter((_, idx) => idx !== i)
      setPreviewIndex(Math.max(0, Math.min(previewIndex, updated.length - 1)))
      return updated
    })
  }

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const imgs = [...prev]
      const [moved] = imgs.splice(from, 1)
      imgs.splice(to, 0, moved)
      setPreviewIndex(to)
      return imgs
    })
  }

  const atMax = images.length >= MAX_IMAGES

  return (
    <div className="space-y-3">
      {/* Hidden inputs for form submission */}
      {images.map((url, idx) => (
        <input key={idx} type="hidden" name="gallery_images" value={url} />
      ))}
      {images.length === 0 && (
        <input type="hidden" name="gallery_images" value="" />
      )}

      {/* Main preview */}
      {images.length > 0 && (
        <div className="relative h-56 overflow-hidden rounded bg-gray-100 group">
          <img
            src={images[previewIndex]}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {previewIndex === 0 && (
            <span className="absolute left-3 top-3 rounded bg-[#1c4f6a] px-2.5 py-1 text-xs font-bold text-white">
              Cover Photo
            </span>
          )}
          <div className="absolute bottom-3 right-3 rounded bg-black/50 px-2.5 py-1 text-xs text-white">
            {previewIndex + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={() => removeImage(previewIndex)}
            className="absolute right-3 top-3 rounded bg-red-500 p-1.5 text-white shadow hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setPreviewIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewIndex(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <div
              key={url + i}
              onClick={() => setPreviewIndex(i)}
              className={`relative h-14 w-16 shrink-0 cursor-pointer overflow-hidden rounded transition-all ${
                i === previewIndex ? 'ring-2 ring-[#1c4f6a]' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeImage(i) }}
                className="absolute right-0.5 top-0.5 rounded bg-red-500 p-0.5 text-white hover:bg-red-600 transition-colors z-10"
              >
                <X size={9} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0.5 pb-0.5 opacity-0 hover:opacity-100 transition-opacity">
                <button type="button" onClick={e => { e.stopPropagation(); i > 0 && moveImage(i, i - 1) }}
                  disabled={i === 0} className="rounded bg-black/60 px-1 text-[10px] text-white disabled:opacity-20">‹</button>
                <button type="button" onClick={e => { e.stopPropagation(); i < images.length - 1 && moveImage(i, i + 1) }}
                  disabled={i === images.length - 1} className="rounded bg-black/60 px-1 text-[10px] text-white disabled:opacity-20">›</button>
              </div>
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#1c4f6a]/80 py-0.5 text-center text-[9px] font-bold text-white">
                  COVER
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); if (!atMax) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !atMax && !uploading && inputRef.current?.click()}
        className={`relative rounded border-2 border-dashed p-6 text-center transition-all ${
          atMax
            ? 'cursor-default border-gray-100 bg-gray-50'
            : dragging
              ? 'scale-[1.01] cursor-copy border-[#1c4f6a] bg-blue-50'
              : uploading
                ? 'cursor-wait border-blue-200 bg-blue-50'
                : 'cursor-pointer border-gray-200 hover:border-[#1c4f6a] hover:bg-gray-50'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#1c4f6a]" />
            <p className="text-sm font-medium text-[#1c4f6a]">Uploading photos...</p>
            <div className="mx-auto mt-1 flex w-full max-w-xs flex-col gap-1">
              {progress.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {p.status === 'uploading' && <Loader2 size={10} className="shrink-0 animate-spin text-blue-400" />}
                  {p.status === 'done' && <span className="shrink-0 text-green-500">✓</span>}
                  {p.status === 'error' && <span className="shrink-0 text-red-500">✗</span>}
                  <span className="truncate text-gray-500">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : atMax ? (
          <div className="flex flex-col items-center gap-1">
            <Upload size={18} className="text-amber-400" />
            <p className="text-sm font-medium text-amber-600">{MAX_IMAGES} / {MAX_IMAGES} photos</p>
            <p className="text-xs text-gray-400">Remove a photo to upload more</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            {images.length === 0
              ? <ImagePlus size={22} className="text-[#1c4f6a]" />
              : <Upload size={22} className="text-[#1c4f6a]" />}
            <p className="text-sm font-medium text-gray-700">
              {dragging ? 'Drop to upload' : images.length === 0 ? 'Drag & drop photos here' : 'Drag & drop to add more'}
            </p>
            <p className="text-xs text-gray-400">or click to browse · JPG, PNG, WebP</p>
            <p className="text-xs text-gray-300">{images.length} / {MAX_IMAGES} photos</p>
          </div>
        )}
      </div>

      {/* Post-upload status */}
      {!uploading && progress.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {progress.map((p, i) => (
            <span key={i} className={`rounded-full px-2 py-1 text-xs ${
              p.status === 'done' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}>
              {p.status === 'done' ? '✓' : '✗'} {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
