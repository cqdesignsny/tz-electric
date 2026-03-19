'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface GalleryProject {
  title: string
  description: string
  category: string
  image: string
  alt: string
}

interface GalleryGridProps {
  categories: string[]
  projects: GalleryProject[]
}

export default function GalleryGrid({ categories, projects }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filtered.length)
  }, [lightboxIndex, filtered.length])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length)
  }, [lightboxIndex, filtered.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [lightboxIndex, goNext, goPrev])

  return (
    <>
      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container-site">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === activeCategory
                    ? 'bg-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, index) => (
              <div
                key={`${project.image}-${index}`}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="bg-gray-200 rounded-xl aspect-[4/3] overflow-hidden relative">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-navy group-hover:text-blue transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue/10 text-blue font-medium px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-12">No projects in this category yet.</p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 z-10 text-white/80 hover:text-white p-2"
              aria-label="Previous image"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-[90vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIndex].image}
              alt={filtered[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h3 className="text-white font-semibold text-lg">
                {filtered[lightboxIndex].title}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {filtered[lightboxIndex].description}
              </p>
            </div>
          </div>

          {/* Next button */}
          {filtered.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 z-10 text-white/80 hover:text-white p-2"
              aria-label="Next image"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {filtered.length}
          </div>
        </div>
      )}
    </>
  )
}
