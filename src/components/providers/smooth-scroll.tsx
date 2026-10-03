"use client"

import { useEffect, useRef } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import { MotionConfig, cancelFrame, frame, useReducedMotion } from "motion/react"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()
  const lenisRef = useRef<LenisRef>(null)

  // Lenis avanza en el mismo ciclo de fotogramas que Motion: el scroll y las
  // animaciones ligadas a él se actualizan juntas, sin un fotograma de retraso.
  useEffect(() => {
    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp)
    }
    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      {reduceMotion ? (
        children
      ) : (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.14, smoothWheel: true }}>
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  )
}
