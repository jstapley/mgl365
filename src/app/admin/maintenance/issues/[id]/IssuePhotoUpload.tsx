'use client'

import { useState, useRef } from 'react'
import { Upload, ExternalLink } from 'lucide-react'
import { updateIssueImage } from '../../actions'

export default function IssuePhotoUpload({ issueId, existingUrl }: { issueId: string; existingUrl: string | null }) {
  const [url, setUrl] = useState(existingUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      const renamed = new File([file], `maintenance/${Date.now()}-${file.name}`, { type: file.type })
      fd.append('file', renamed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        setUrl(json.url)
        await updateIssueImage(issueId, json.url)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {url ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Issue photo" className="h-28 w-28 rounded border border-gray-200 object-cover" />
          <div className="space-y-2 pt-1">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#1f5772] hover:underline">
              <ExternalLink size={13} />
              View full size
            </a>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-[#1f5772] hover:text-[#1f5772] disabled:opacity-40 transition-colors">
              <Upload size={11} />
              {uploading ? 'Uploading…' : 'Replace photo'}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 rounded border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-[#1f5772] hover:text-[#1f5772] disabled:opacity-40 transition-colors">
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Upload photo'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFile} disabled={uploading} />
    </div>
  )
}
