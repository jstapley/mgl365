'use client'

import { useRef, useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

interface LiabilityData {
  agreed: boolean
  name: string
  date: string
  signature: string
}

interface Props {
  content: string | null
  villaName: string
  onChange: (data: LiabilityData) => void
}

const today = new Date().toISOString().split('T')[0]

export default function LiabilityWaiver({ content, villaName, onChange }: Props) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signedName, setSignedName] = useState('')
  const [signedDate, setSignedDate] = useState(today)
  const [hasSigned, setHasSigned] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  // If content is short enough that there's no scrollbar, unlock immediately
  useEffect(() => {
    const el = scrollRef.current
    if (el && el.scrollHeight <= el.clientHeight + 4) {
      setHasScrolled(true)
    }
  }, [content])

  // Size canvas to its CSS dimensions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#1f5772'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [hasScrolled]) // re-init after the section becomes visible

  // Notify parent whenever anything changes
  useEffect(() => {
    const signature = hasSigned ? (canvasRef.current?.toDataURL('image/png') ?? '') : ''
    onChangeRef.current({ agreed, name: signedName, date: signedDate, signature })
  }, [agreed, signedName, signedDate, hasSigned])

  // ── Scroll tracking ──
  function handleScroll() {
    const el = scrollRef.current
    if (!el || hasScrolled) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setHasScrolled(true)
    }
  }

  // ── Canvas helpers ──
  function getPos(clientX: number, clientY: number) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function startDraw(x: number, y: number) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    isDrawing.current = true
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function continueDraw(x: number, y: number) {
    if (!isDrawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasSigned) setHasSigned(true)
  }

  function stopDraw() { isDrawing.current = false }

  function clearSignature() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSigned(false)
    setAgreed(false)
  }

  // ── Mouse handlers ──
  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getPos(e.clientX, e.clientY)
    startDraw(x, y)
  }
  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const { x, y } = getPos(e.clientX, e.clientY)
    continueDraw(x, y)
  }

  // ── Touch handlers ──
  function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const { x, y } = getPos(e.touches[0].clientX, e.touches[0].clientY)
    startDraw(x, y)
  }
  function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const { x, y } = getPos(e.touches[0].clientX, e.touches[0].clientY)
    continueDraw(x, y)
  }

  const canAgree = hasScrolled && signedName.trim().length > 0 && hasSigned

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-2 text-base font-semibold text-gray-900">Liability Waiver</h2>
      <p className="mb-4 text-xs text-gray-500">
        Please read the entire waiver below. Signing fields will unlock once you reach the bottom.
      </p>

      {/* Scrollable content */}
      <div className="relative mb-5">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-56 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap"
        >
          {content ?? 'Liability waiver content has not been configured yet. Contact your property manager.'}
        </div>
        {!hasScrolled && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center rounded-b bg-gradient-to-t from-gray-100 to-transparent pb-2 pt-6">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              ↓ Scroll to continue
            </span>
          </div>
        )}
      </div>

      {/* Signing section — faded until scrolled */}
      <div
        className={`space-y-4 transition-opacity duration-500 ${
          hasScrolled ? 'opacity-100' : 'pointer-events-none opacity-25'
        }`}
      >
        {/* Name + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Full name *</label>
            <input
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              disabled={!hasScrolled}
              placeholder="Enter your full name"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={signedDate}
              onChange={(e) => setSignedDate(e.target.value)}
              disabled={!hasScrolled}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Signature canvas */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">Signature *</label>
            {hasSigned && (
              <button
                type="button"
                onClick={clearSignature}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <RotateCcw size={11} />
                Clear
              </button>
            )}
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={stopDraw}
            style={{ height: '88px', touchAction: 'none' }}
            className={`w-full cursor-crosshair rounded border bg-white ${
              hasSigned ? 'border-[#1f5772]/40' : 'border-gray-300'
            }`}
          />
          {!hasSigned && hasScrolled && (
            <p className="mt-1 text-xs text-gray-400">Draw your signature in the box above</p>
          )}
        </div>

        {/* Agreement checkbox */}
        <label
          className={`flex items-start gap-3 ${canAgree ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={!canAgree}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1f5772] disabled:cursor-not-allowed"
          />
          <span className={`text-sm ${canAgree ? 'text-gray-700' : 'text-gray-400'}`}>
            I, <strong>{signedName || '___________'}</strong>, have read and agree to the liability
            waiver for {villaName}.
          </span>
        </label>

        {/* Helper text */}
        {hasScrolled && !canAgree && (
          <p className="text-xs text-amber-600">
            {!signedName.trim() && !hasSigned
              ? 'Enter your full name and draw your signature to continue.'
              : !signedName.trim()
              ? 'Enter your full name to continue.'
              : 'Draw your signature above to continue.'}
          </p>
        )}
      </div>
    </div>
  )
}
