// app/components/Live.tsx
'use client'

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import type * as FaceAPI from '@vladmandic/face-api'
import { useCallback, useEffect, useRef, useState } from 'react'

/** 調整パラメータ（重い場合はもっと下げてもOK） */
const DETECT_FPS = 10
const DETECTOR_INPUT = 224
const EXPRESSION_THRESHOLD = 0.72
const COOLDOWN_MS = 1500

type TinyFaceDetectorOptions = InstanceType<
  typeof FaceAPI.TinyFaceDetectorOptions
>

type NextDataWindow = Window & { __NEXT_DATA__?: { assetPrefix?: string } }
function hasNextData(w: unknown): w is NextDataWindow {
  if (typeof w !== 'object' || w === null) return false
  const obj = w as Record<string, unknown>
  return Object.prototype.hasOwnProperty.call(obj, '__NEXT_DATA__')
}
const ASSET_PREFIX =
  (typeof window !== 'undefined' && hasNextData(window)
    ? window.__NEXT_DATA__?.assetPrefix ?? ''
    : '') ||
  process.env.NEXT_PUBLIC_BASE_PATH ||
  ''

/** 撮影結果を親に返すための props */
type LiveProps = {
  onShot?: (emotion: string | null) => void
}

export default function Live({ onShot }: LiveProps = {}) {
  // ----- Refs / State -----
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const faceapiRef = useRef<typeof import('@vladmandic/face-api') | null>(null)
  const modelsLoadedRef = useRef(false)
  const loadingRef = useRef<Promise<void> | null>(null)

  const detectorOptRef = useRef<TinyFaceDetectorOptions | null>(null)
  const lastInputSizeRef = useRef<number>(DETECTOR_INPUT)

  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState('初期化中…')
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  const [liveEmotion, setLiveEmotion] = useState<string | null>(null) // ライブ推定（画面には表示しない）
  const [shotEmotion, setShotEmotion] = useState<string | null>(null) // 撮影後だけ表示する

  // 軽量化：FPS間引き & タブ非表示で停止
  const lastRunRef = useRef(0)
  const [pageVisible, setPageVisible] = useState(true)

  // 連発抑制
  const lastEmotionRef = useRef<string | null>(null)
  const lastEmitTsRef = useRef(0)

  // ----- helpers -----
  async function waitVideoReady(video: HTMLVideoElement) {
    if (video.videoWidth && video.videoHeight) return
    await new Promise<void>((resolve) => {
      const on = () => resolve()
      if (video.videoWidth && video.videoHeight) return resolve()
      video.addEventListener('loadedmetadata', on, { once: true })
    })
    try {
      await video.play()
    } catch {
      /* no-op */
    }
  }

  // ----- モデル読み込み -----
  useEffect(() => {
    let cancelled = false
    loadingRef.current ??= (async () => {
      try {
        setStatus('TensorFlow 準備中…')
        try {
          await tf.setBackend('webgl')
        } catch {
          await tf.setBackend('cpu')
        }
        await tf.ready()

        setStatus('モデル読み込み中…')
        const faceapi = await import('@vladmandic/face-api')
        if (cancelled) return
        faceapiRef.current = faceapi

        const base = `${ASSET_PREFIX}/models`.replace(/\/{2,}/g, '/')
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(base),
          faceapi.nets.faceExpressionNet.loadFromUri(base),
        ])
        if (!cancelled) {
          modelsLoadedRef.current = true
          setStatus('')
        }
      } catch (e) {
        console.error('[face-api] model loading failed:', e)
        setError('モデルの初期化でエラーが発生しました')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ----- タブ非表示で停止 -----
  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // ----- カメラ起動 -----
  const startCamera = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    setShotEmotion(null) // 撮影前は結果を出さない
    setStatus('カメラ起動中…')

    if (video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      video.srcObject = stream
      video.setAttribute('playsinline', '')
      video.muted = true
      video.autoplay = true

      await waitVideoReady(video)
      setIsActive(true)
      setStatus('')
    } catch (e) {
      console.error('[camera] getUserMedia failed', e)
      setError('カメラの起動に失敗しました（権限/デバイスをご確認ください）')
      setIsActive(false)
    }
  }, [])

  // ----- カメラ停止 -----
  const stopCamera = useCallback(() => {
    const video = videoRef.current
    if (video && video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height)

    setIsActive(false)
    setLiveEmotion(null)
    setStatus('停止中')
  }, [])

  // ----- 撮影（親へも通知） -----
  const shot = useCallback(() => {
    const fixed = liveEmotion ?? null
    if (onShot) onShot(fixed) // 親に渡して保存などに使用
    setShotEmotion(fixed) // ← 撮影後にだけ表示する
    stopCamera() // 運用に合わせて停止（継続したいなら消してOK）
  }, [liveEmotion, onShot, stopCamera])

  // ----- 検出＆描画 -----
  const detectFaces = useCallback(async () => {
    const faceapi = faceapiRef.current
    if (!faceapi || !modelsLoadedRef.current) return
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    await waitVideoReady(video)

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return

    const canvas = canvasRef.current
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height

    if (
      !detectorOptRef.current ||
      lastInputSizeRef.current !== DETECTOR_INPUT
    ) {
      detectorOptRef.current = new faceapi.TinyFaceDetectorOptions({
        inputSize: DETECTOR_INPUT,
        scoreThreshold: 0.4,
      })
      lastInputSizeRef.current = DETECTOR_INPUT
    }

    const detections = await faceapi
      .detectAllFaces(video, detectorOptRef.current)
      .withFaceExpressions()

    faceapi.matchDimensions(canvas, { width, height })
    const resized = faceapi.resizeResults(detections, { width, height })

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (resized.length > 0) {
      faceapi.draw.drawDetections(
        canvas,
        resized.map((r) => r.detection),
      )
    }

    // ライブ推定は内部状態としてキープ（画面には出さない）
    if (detections.length > 0) {
      const exps = detections[0].expressions
      if (exps) {
        const entries = Object.entries(exps).sort((a, b) => b[1] - a[1])
        const [bestLabel, bestScore] = entries[0]
        const now = performance.now()
        const isNew = bestLabel !== lastEmotionRef.current
        const cooled = now - lastEmitTsRef.current > COOLDOWN_MS
        if (bestScore >= EXPRESSION_THRESHOLD && (isNew || cooled)) {
          setLiveEmotion(bestLabel)
          lastEmotionRef.current = bestLabel
          lastEmitTsRef.current = now
        }
      }
    }
  }, [])

  // ----- 推論ループ -----
  useEffect(() => {
    let rafId = 0
    const loop = async (ts: number) => {
      if (isActive && pageVisible) {
        if (ts - lastRunRef.current >= 1000 / DETECT_FPS) {
          lastRunRef.current = ts
          await detectFaces()
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, pageVisible, detectFaces])

  // ----- UI -----
  return (
    <div className='mx-auto max-w-3xl'>
      {/* 見出し：ピンクの下線 */}
      <div className='my-32 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
        カメラ診断
      </div>

      <div className='relative w-full h-[360px] bg-black rounded mb-3 sm:mb-4'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='absolute inset-0 w-full h-full object-contain z-0 bg-black'
        />
        <canvas
          ref={canvasRef}
          className='absolute inset-0 w-full h-full pointer-events-none z-10'
        />

        {(status || error) && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/40 text-white'>
            <div className='flex items-center gap-3 px-4 py-2 rounded-lg bg-black/60'>
              <div className='h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin' />
              <span className='text-sm'>
                {error ? error : status || '検出中…'}
              </span>
            </div>
          </div>
        )}

        <div className='absolute right-2 top-2 z-30 px-2 py-1 text-xs rounded bg-black/60 text-white'>
          {isActive ? (status ? status : '検出中…') : '停止中'}
        </div>
      </div>

      {/* ボタン：青×ピンク、中央寄せ、スマホ縦/PC横 */}
      <div className='mt-5 w-full'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2'>
          <button
            onClick={startCamera}
            className='px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition'
          >
            カメラ起動
          </button>
          <button
            onClick={shot}
            className='px-5 py-2.5 rounded-xl font-semibold bg-pink-500 text-white shadow-sm hover:bg-pink-600 active:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-300 transition'
          >
            撮影
          </button>
          <button
            onClick={stopCamera}
            className='px-5 py-2.5 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition'
          >
            カメラ停止
          </button>
        </div>
      </div>

      {/* 診断結果：撮影後のみ太字で表示 */}
      {shotEmotion !== null && (
        <div className='mt-6 text-center'>
          <span className='text-lg sm:text-xl font-bold text-gray-700 mr-2'>
            診断結果：
          </span>
          <span className='text-2xl sm:text-3xl font-extrabold text-pink-600'>
            {shotEmotion}
          </span>
        </div>
      )}
    </div>
  )
}
