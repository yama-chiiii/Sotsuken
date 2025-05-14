'use client'

import * as faceapi from 'face-api.js'
import { RefObject, useCallback, useEffect } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  isActive: boolean
}

export default function LiveFace({ videoRef, canvasRef, isActive }: Props) {
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const width = video.videoWidth
    const height = video.videoHeight

    if (width === 0 || height === 0) {
      // 🔒 videoの準備ができていない
      return
    }

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions(),
    )

    const dims = { width, height }
    faceapi.matchDimensions(canvasRef.current, dims)
    const resized = faceapi.resizeResults(detections, dims)

    const ctx = canvasRef.current.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      faceapi.draw.drawDetections(canvasRef.current, resized)
    }
  }, [videoRef, canvasRef])

  // ✅ モデル読み込みのみ（カメラ起動はしない！）
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      console.log('✅ モデル読み込み完了')
    }
    loadModels()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive) {
      interval = setInterval(() => {
        detectFaces()
      }, 100)
    } else {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      }
    }

    return () => clearInterval(interval)
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
