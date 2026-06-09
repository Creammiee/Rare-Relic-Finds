'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const hasImages = images.length > 0
  const mainImage = hasImages ? images[current] : '/placeholder-relic.jpg'

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-black-800 border border-white/8 cursor-zoom-in group"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-2 rounded-lg bg-black/60 text-white/70">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length) }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-xs text-white/70">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                i === current ? 'border-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-3xl aspect-square p-4">
            <Image
              src={mainImage}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-relic.jpg' }}
            />
          </div>
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-sm">
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
