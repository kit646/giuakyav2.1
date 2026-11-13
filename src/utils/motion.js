import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins once at module load
gsap.registerPlugin(useGSAP, ScrollTrigger)

// Subtle, editorial-grade defaults tuned for 60fps GPU-only properties
gsap.defaults({
  ease: 'power3.out',
  duration: 0.55,
})

/**
 * Check whether the user requested reduced motion in OS/browser settings.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Initialize Lenis smooth wheel scrolling synchronized with GSAP's ticker & ScrollTrigger.
 * Skipped automatically if the user prefers reduced motion.
 * Touch scrolling stays native (Lenis does not hijack touch events).
 */
export function initLenisMotion() {
  if (typeof window === 'undefined' || prefersReducedMotion()) {
    return () => {}
  }

  const lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    anchors: true,
  })

  const onScroll = () => ScrollTrigger.update()
  lenis.on('scroll', onScroll)

  const tick = (time) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  const onLoad = () => ScrollTrigger.refresh()
  window.addEventListener('load', onLoad)

  return () => {
    window.removeEventListener('load', onLoad)
    lenis.off('scroll', onScroll)
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}

/**
 * Safely refresh ScrollTrigger coordinates on the next animation frame.
 */
export function refreshScrollTriggers() {
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
}

/**
 * Safely query targets inside a scope element or container ref.
 * Filters out missing nodes to avoid GSAP "target not found" warnings.
 */
function resolveTargets(scopeEl, selectorOrNodes) {
  if (!selectorOrNodes) return []
  if (typeof selectorOrNodes === 'string') {
    const root = scopeEl || document
    return Array.from(root.querySelectorAll(selectorOrNodes))
  }
  if (Array.isArray(selectorOrNodes)) {
    return selectorOrNodes.filter(Boolean)
  }
  if (selectorOrNodes instanceof NodeList) {
    return Array.from(selectorOrNodes)
  }
  return selectorOrNodes ? [selectorOrNodes] : []
}

/**
 * Immediate GPU-composited entrance animation (translateY/scale + opacity only).
 * Clears transform & will-change on completion so sticky descendants
 * and CSS transitions stay intact.
 */
export function animateEntrance(scopeEl, targets, options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length || prefersReducedMotion()) return null

  const {
    y = 14,
    x = 0,
    scale = 1,
    duration = 0.45,
    delay = 0,
    stagger = 0,
    ease = 'power3.out',
    onComplete,
  } = options

  gsap.set(nodes, { willChange: 'transform, opacity' })

  return gsap.fromTo(
    nodes,
    { opacity: 0, y, x, scale },
    {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      stagger,
      ease,
      force3D: true,
      clearProps: 'transform,opacity,willChange',
      onComplete,
    }
  )
}

/**
 * Lightweight 60fps scroll-triggered batch reveal for cards & lists.
 * Only animates transform (y) + opacity, groups elements entering together
 * into a single stagger wave, and immediately clears transform/will-change when settled.
 */
export function initScrollRevealBatch(scopeEl, targets, options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length) return []

  if (prefersReducedMotion()) {
    gsap.set(nodes, { opacity: 1, clearProps: 'transform,opacity,willChange' })
    return []
  }

  const {
    y = 20,
    duration = 0.55,
    stagger = 0.055,
    start = 'top 92%',
    ease = 'power3.out',
  } = options

  gsap.set(nodes, { opacity: 0, y, willChange: 'transform, opacity' })

  const revealBatch = (batch, fast = false) => {
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: fast ? 0.2 : duration,
      stagger: fast ? 0 : { each: stagger, from: 'start' },
      ease,
      overwrite: 'auto',
      force3D: true,
      clearProps: 'transform,opacity,willChange',
    })
  }

  return ScrollTrigger.batch(nodes, {
    start,
    once: true,
    onEnter: (batch) => revealBatch(batch, false),
    onEnterBack: (batch) => revealBatch(batch, true),
    onLeave: (batch) => revealBatch(batch, true),
  })
}

/**
 * Gentle scroll-triggered reveal for standalone sections (part summaries, navigator panels).
 * Strictly compositor-only (transform + opacity).
 */
export function initScrollRevealSections(scopeEl, targets, options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length) return []

  if (prefersReducedMotion()) {
    gsap.set(nodes, { opacity: 1, clearProps: 'transform,opacity,willChange' })
    return []
  }

  const {
    y = 18,
    duration = 0.6,
    start = 'top 90%',
    ease = 'power3.out',
  } = options

  return nodes.map((node) => {
    gsap.set(node, { willChange: 'transform, opacity' })
    return gsap.fromTo(
      node,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        ease,
        force3D: true,
        clearProps: 'transform,opacity,willChange',
        scrollTrigger: {
          trigger: node,
          start,
          once: true,
        },
      }
    )
  })
}

/**
 * Animate progress bars using GPU-accelerated `scaleX` (never `width` layout thrash).
 * Supports optional ScrollTrigger when bars sit below the fold.
 */
export function animateProgressBars(scopeEl, targets, targetScales = [], options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length) return null

  if (prefersReducedMotion()) {
    nodes.forEach((node, idx) => {
      const ratio = Math.max(0, Math.min(1, targetScales[idx] ?? 1))
      gsap.set(node, { scaleX: ratio, transformOrigin: 'left center' })
    })
    return null
  }

  const {
    duration = 0.65,
    delay = 0.1,
    stagger = 0.06,
    ease = 'power3.out',
    triggerEl = null,
  } = options

  gsap.set(nodes, { transformOrigin: 'left center', willChange: 'transform' })

  const tweenVars = {
    scaleX: (idx) => Math.max(0, Math.min(1, targetScales[idx] ?? 1)),
    duration,
    delay,
    stagger,
    ease,
    force3D: true,
    clearProps: targetScales.every((s) => s === 1) ? 'transform,willChange' : 'willChange',
  }

  if (triggerEl) {
    tweenVars.scrollTrigger = {
      trigger: triggerEl,
      start: 'top 90%',
      once: true,
    }
  }

  return gsap.fromTo(nodes, { scaleX: 0 }, tweenVars)
}

/**
 * Animate an integer counter smoothly using GSAP proxy object (zero layout impact).
 */
export function animateCounter(el, targetValue, options = {}) {
  if (!el) return null
  const finalVal = Math.round(Number(targetValue) || 0)

  if (prefersReducedMotion()) {
    el.textContent = String(finalVal)
    return null
  }

  const { from = Math.max(0, finalVal - 40), duration = 0.85, delay = 0.08, ease = 'power2.out' } = options
  const counter = { val: from }

  return gsap.to(counter, {
    val: finalVal,
    duration,
    delay,
    ease,
    snap: { val: 1 },
    onUpdate: () => {
      el.textContent = String(Math.round(counter.val))
    },
  })
}

export { gsap, ScrollTrigger, useGSAP }
