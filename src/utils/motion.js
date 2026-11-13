import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Register @gsap/react once at module load
gsap.registerPlugin(useGSAP)

// Crisp, responsive defaults tuned for 60fps UI transitions
gsap.defaults({
  ease: 'power3.out',
  duration: 0.38,
})

/**
 * Check whether the user requested reduced motion in OS/browser settings.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
 * GPU-composited entrance animation (translateY + opacity only).
 * Always clears transform & will-change on completion so sticky descendants
 * and CSS hover transitions continue working normally.
 */
export function animateEntrance(scopeEl, targets, options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length || prefersReducedMotion()) return null

  const {
    y = 14,
    x = 0,
    scale = 1,
    duration = 0.36,
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
 * Fast, capped stagger entrance for card grids & lists (Dashboard cards, Review cards).
 * Uses `amount` capping when many items exist so the tail never feels sluggish.
 */
export function animateStaggerCards(scopeEl, targets, options = {}) {
  const nodes = resolveTargets(scopeEl, targets)
  if (!nodes.length || prefersReducedMotion()) return null

  const {
    y = 16,
    duration = 0.36,
    maxTotalStagger = 0.32,
    each = 0.035,
    delay = 0,
    ease = 'power3.out',
  } = options

  const staggerConfig =
    nodes.length * each > maxTotalStagger
      ? { amount: maxTotalStagger, from: 'start' }
      : { each, from: 'start' }

  gsap.set(nodes, { willChange: 'transform, opacity' })

  return gsap.fromTo(
    nodes,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger: staggerConfig,
      ease,
      force3D: true,
      clearProps: 'transform,opacity,willChange',
    }
  )
}

/**
 * Animate progress bars using GPU-accelerated `scaleX` (never `width` layout thrash).
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

  const { duration = 0.65, delay = 0.15, stagger = 0.06, ease = 'power3.out' } = options

  gsap.set(nodes, { transformOrigin: 'left center', willChange: 'transform' })

  return gsap.fromTo(
    nodes,
    { scaleX: 0 },
    {
      scaleX: (idx) => Math.max(0, Math.min(1, targetScales[idx] ?? 1)),
      duration,
      delay,
      stagger,
      ease,
      force3D: true,
      clearProps: targetScales.every((s) => s === 1) ? 'transform,willChange' : 'willChange',
    }
  )
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

export { gsap, useGSAP }
