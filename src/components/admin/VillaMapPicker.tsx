'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'

interface Props {
  initialLat?: number | null
  initialLng?: number | null
}

declare global {
  interface Window {
    google: any
    initVillaMapPicker: () => void
  }
}

export default function VillaMapPicker({ initialLat, initialLng }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [pinned, setPinned] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )
  const [lat, setLat] = useState<number | null>(initialLat ?? null)
  const [lng, setLng] = useState<number | null>(initialLng ?? null)

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) { setLoaded(true); return }
    if (document.getElementById('gmap-script')) {
      const interval = setInterval(() => {
        if (window.google?.maps) { setLoaded(true); clearInterval(interval) }
      }, 100)
      return () => clearInterval(interval)
    }
    window.initVillaMapPicker = () => setLoaded(true)
    const script = document.createElement('script')
    script.id = 'gmap-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initVillaMapPicker&loading=async`
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!loaded) return
    setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return

      const initialCenter = pinned || { lat: 17.0747, lng: -61.8175 }
      const map = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: pinned ? 15 : 11,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      if (pinned) {
        const marker = new window.google.maps.Marker({
          position: pinned,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        })
        markerRef.current = marker
        marker.addListener('dragend', () => {
          const pos = marker.getPosition()
          if (pos) updatePin(pos.lat(), pos.lng())
        })
      }

      map.addListener('click', (e: any) => {
        if (!e.latLng) return
        placeMarker(e.latLng.lat(), e.latLng.lng(), map)
      })

      if (inputRef.current && !autocompleteRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['geometry', 'formatted_address'],
          componentRestrictions: { country: 'ag' },
        })
        autocompleteRef.current = autocomplete
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place.geometry?.location) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          map.setCenter({ lat, lng })
          map.setZoom(16)
          placeMarker(lat, lng, map)
        })
      }
    }, 0)
  }, [loaded])

  function placeMarker(lat: number, lng: number, map: any) {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng })
    } else {
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      })
      markerRef.current = marker
      marker.addListener('dragend', () => {
        const pos = marker.getPosition()
        if (pos) updatePin(pos.lat(), pos.lng())
      })
    }
    updatePin(lat, lng)
  }

  function updatePin(lat: number, lng: number) {
    setPinned({ lat, lng })
    setLat(lat)
    setLng(lng)
  }

  function clearPin() {
    if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
    }
    setPinned(null)
    setLat(null)
    setLng(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs that submit with the form */}
      <input type="hidden" name="lat" value={lat ?? ''} />
      <input type="hidden" name="lng" value={lng ?? ''} />

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for the property address..."
          className="w-full rounded border border-gray-300 pl-9 pr-4 py-2 text-sm outline-none focus:border-[#1f5772]"
          disabled={!loaded}
        />
      </div>

      {!loaded && (
        <div className="h-72 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#1f5772] rounded-full animate-spin" />
            <p className="text-sm">Loading map…</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`h-72 overflow-hidden rounded border border-gray-200 ${!loaded ? 'hidden' : ''}`}
      />

      {pinned ? (
        <div className="flex items-center justify-between rounded border border-green-100 bg-green-50 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MapPin size={14} className="shrink-0 text-green-500" />
            <span className="font-medium">Location pinned</span>
            <span className="text-xs text-green-500">
              ({pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)})
            </span>
          </div>
          <button type="button" onClick={clearPin} className="p-1 text-gray-400 hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400">
          Search for an address or click the map to drop a pin
        </p>
      )}
    </div>
  )
}
