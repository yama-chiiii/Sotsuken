'use client'

import { useRef, useState } from 'react'

export default function CameraAnalyzer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [result, setResult] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

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

  const captureAndAnalyze = async () => {
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

      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.status === 'success') {
        setResult(`顔の状態: ${data.result.face_condition} (R値: ${data.result.color_score})`)
      } else {
        setResult(`エラー: ${data.message}`)
      }
    }, 'image/jpeg')
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: 500 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="flex gap-2">
        <button onClick={startCamera} className="bg-blue-600 text-white px-4 py-2 rounded">カメラ起動</button>
        <button onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded">カメラ停止</button>
        <button onClick={captureAndAnalyze} className="bg-green-600 text-white px-4 py-2 rounded">顔色解析</button>
      </div>
      {result && <p>{result}</p>}
    </div>
  )
}
