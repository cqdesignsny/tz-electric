'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export default function ElectricCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const animFrameRef = useRef<number>(0)

  const createSparks = useCallback((x: number, y: number, dx: number, dy: number) => {
    const speed = Math.sqrt(dx * dx + dy * dy)
    if (speed < 2) return

    const count = Math.min(Math.floor(speed / 3), 5)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const velocity = 1 + Math.random() * 3
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * velocity + dx * 0.2,
        vy: Math.sin(angle) * velocity + dy * 0.2,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.4,
        size: 1 + Math.random() * 2,
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - prevMouseRef.current.x
      const dy = y - prevMouseRef.current.y

      prevMouseRef.current = { ...mouseRef.current }
      mouseRef.current = { x, y }

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        createSparks(x, y, dx, dy)
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      sparksRef.current = sparksRef.current.filter((spark) => {
        spark.life -= 0.016 / spark.maxLife
        if (spark.life <= 0) return false

        spark.x += spark.vx
        spark.y += spark.vy
        spark.vx *= 0.96
        spark.vy *= 0.96
        spark.vy += 0.1 // gravity

        const alpha = spark.life * 0.8
        const size = spark.size * spark.life

        // Electric blue glow
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.3})`
        ctx.fill()

        // Bright core
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`
        ctx.fill()

        // White hot center
        ctx.beginPath()
        ctx.arc(spark.x, spark.y, size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()

        // Occasional lightning bolt lines between close sparks
        if (Math.random() > 0.92) {
          const nearby = sparksRef.current.find(
            (other) =>
              other !== spark &&
              Math.abs(other.x - spark.x) < 30 &&
              Math.abs(other.y - spark.y) < 30
          )
          if (nearby) {
            ctx.beginPath()
            ctx.moveTo(spark.x, spark.y)
            const midX = (spark.x + nearby.x) / 2 + (Math.random() - 0.5) * 10
            const midY = (spark.y + nearby.y) / 2 + (Math.random() - 0.5) * 10
            ctx.quadraticCurveTo(midX, midY, nearby.x, nearby.y)
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha * 0.6})`
            ctx.lineWidth = 0.5 + Math.random()
            ctx.stroke()
          }
        }

        return true
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    parent.addEventListener('mousemove', handleMouseMove)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animFrameRef.current)
      ro.disconnect()
    }
  }, [createSparks])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      aria-hidden="true"
    />
  )
}
