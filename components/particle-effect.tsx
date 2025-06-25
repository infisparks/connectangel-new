"use client"

import type React from "react"
import { useRef, useEffect, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
}

const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const particles = useRef<Particle[]>([])
  const maxParticles = 100
  const connectionDistance = 150 // Max distance for particles to connect

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const colors = ["#b35dff", "#8700ff"] // Your purple gradient colors
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, // Slower movement
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.5, // Smaller particles
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2, // More transparent
    }
  }, [])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.current.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap particles around the canvas edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Number.parseInt(p.color.slice(1, 3), 16)}, ${Number.parseInt(
          p.color.slice(3, 5),
          16,
        )}, ${Number.parseInt(p.color.slice(5, 7), 16)}, ${p.alpha})`
        ctx.fill()

        // Draw lines between nearby particles
        for (let j = i + 1; j < particles.current.length; j++) {
          const p2 = particles.current[j]
          const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2))

          if (dist < connectionDistance) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(${Number.parseInt(p.color.slice(1, 3), 16)}, ${Number.parseInt(
              p.color.slice(3, 5),
              16,
            )}, ${Number.parseInt(p.color.slice(5, 7), 16)}, ${(1 - dist / connectionDistance) * 0.3})` // Fading lines
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      // Add new particles if below max
      while (particles.current.length < maxParticles) {
        particles.current.push(createParticle(canvas))
      }

      // Remove particles that are too old or out of bounds (optional, but good for performance)
      // For this effect, wrapping is used, so no removal based on bounds.
      // If particles were to fade out, you'd add a 'life' property and remove them when life <= 0.

      animationFrameId.current = requestAnimationFrame(() => draw(ctx, canvas))
    },
    [createParticle],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-initialize particles on resize to distribute them correctly
      particles.current = Array.from({ length: maxParticles }, () => createParticle(canvas))
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Initialize particles
    particles.current = Array.from({ length: maxParticles }, () => createParticle(canvas))

    // Start animation loop
    animationFrameId.current = requestAnimationFrame(() => draw(ctx, canvas))

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [createParticle, draw])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

export default ParticleEffect
