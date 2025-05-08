'use client'

import { useEffect, useRef, useState } from 'react'

type Detection = {
  label: string
  confidence: number
  box: [number, number, number, number] // x1, y1, x2, y2
}

export default function CameraButton() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.current) {
      videoRef.current.srcObject = s
      await videoRef.current.play()
      setStream(s)
      console.log('✅ カメラ起動完了')
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    console.log('🛑 カメラ停止')
  }

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const width = videoRef.current.videoWidth
    const height = videoRef.current.videoHeight
    canvasRef.current.width = width
    canvasRef.current.height = height

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0, width, height)

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      const formData = new FormData()
      formData.append('file', blob, 'capture.jpg')

      try {
        const res = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        ctx.drawImage(videoRef.current!, 0, 0, width, height) // 背景として再描画
        if (data.status === 'success') {
          const detections: Detection[] = data.result.detections
          if (detections.length === 0) {
            setResult('顔は検出されませんでした')
          } else {
            setResult(`顔を ${detections.length} 個検出しました`)
          }

          ctx.strokeStyle = 'lime'
          ctx.lineWidth = 2
          ctx.font = '16px sans-serif'
          ctx.fillStyle = 'lime'

          detections.forEach((det) => {
            const [x1, y1, x2, y2] = det.box
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
            ctx.fillText(`${det.label} (${(det.confidence * 100).toFixed(1)}%)`, x1, y1 - 6)
          })
        } else {
          setResult(`エラー: ${data.message}`)
        }
      } catch (err) {
        console.error('通信エラー:', err)
        setResult('サーバーに接続できませんでした')
      }
    }, 'image/jpeg')
  }

  useEffect(() => {
    const interval = setInterval(analyzeFrame, 2000) // 2秒ごとに解析
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', maxWidth: 500, display: 'none' }}
      />
      <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 500 }} />
      <div className="flex gap-2">
        <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded">カメラ起動</button>
        <button onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded">カメラ停止</button>
      </div>
      {result && <p>{result}</p>}
    </div>
  )
}
