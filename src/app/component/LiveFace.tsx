'use client'

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import { RefObject, useCallback, useEffect, useRef } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  isActive: boolean
  onEmotion?: (emotion: string) => void
}

type NextDataWindow = Window & {
  __NEXT_DATA__?: { assetPrefix?: string };
};

function hasNextData(w: unknown): w is NextDataWindow {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof w === "object" && w !== null && "__NEXT_DATA__" in (w as any);
}

const ASSET_PREFIX =
  (typeof window !== "undefined" && hasNextData(window)
    ? window.__NEXT_DATA__?.assetPrefix ?? ""
    : "") ||
  process.env.NEXT_PUBLIC_BASE_PATH ||
  "";


export default function LiveFace({ videoRef, canvasRef, isActive, onEmotion }: Props) {
  const faceapiRef = useRef<typeof import('@vladmandic/face-api') | null>(null)
  const modelsLoadedRef = useRef(false)
  const loadingRef = useRef<Promise<void> | null>(null)
  const lastEmotionRef = useRef<string | null>(null)
  const lastEmitTsRef = useRef<number>(0)

  useEffect(() => {
    let cancelled = false
    loadingRef.current ??= (async () => {
      try {
        // 1) TF バックエンド選択
        try {
          await tf.setBackend('webgl')
        } catch {
          await tf.setBackend('cpu')
        }
        await tf.ready()

        // 2) face-api の動的 import
        const faceapi = await import('@vladmandic/face-api')
        if (cancelled) return
        faceapiRef.current = faceapi

        // 3) モデル読み込み（/public/models 配下）
        const base = `${ASSET_PREFIX}/models`
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(base),
          faceapi.nets.faceExpressionNet.loadFromUri(base),
          // 必要なら:
          // faceapi.nets.faceLandmark68Net.loadFromUri(base),
        ])

        if (!cancelled) modelsLoadedRef.current = true
      } catch (e) {
        console.error('[face-api] model loading failed:', e)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const detectFaces = useCallback(async () => {
    const faceapi = faceapiRef.current
    if (!faceapi || !modelsLoadedRef.current) return
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return

    const canvas = canvasRef.current
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()

    faceapi.matchDimensions(canvas, { width, height })
    const resized = faceapi.resizeResults(detections, { width, height })

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resized)

    if (typeof onEmotion === 'function' && detections.length > 0) {
      const exps = detections[0].expressions
      if (exps) {
        const [bestLabel, bestScore] = Object.entries(exps).sort((a, b) => b[1] - a[1])[0]!
        const now = performance.now()
        const THRESHOLD = 0.7
        const COOLDOWN = 1500
        const isNew = bestLabel !== lastEmotionRef.current
        const cooled = now - lastEmitTsRef.current > COOLDOWN
        if (bestScore >= THRESHOLD && (isNew || cooled)) {
          onEmotion(bestLabel)
          lastEmotionRef.current = bestLabel
          lastEmitTsRef.current = now
        }
      }
    }
  }, [videoRef, canvasRef, onEmotion])

  useEffect(() => {
    let rafId = 0
    const loop = async () => {
      await detectFaces()
      rafId = requestAnimationFrame(loop)
    }

    if (isActive) {
      rafId = requestAnimationFrame(loop)
    } else {
      const c = canvasRef.current
      const ctx = c?.getContext('2d')
      if (c && ctx) ctx.clearRect(0, 0, c.width, c.height)
    }
    return () => cancelAnimationFrame(rafId)
  }, [isActive, detectFaces, canvasRef])

  return (
    <div className='relative w-4/5 h-320 mt-12 mx-auto'>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className='absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0'
      />
      <canvas
        ref={canvasRef}
        className='absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10'
      />
    </div>
  )
}
