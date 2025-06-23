'use client'

import moment from 'moment'
import { RefObject, useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  setIsActive: (active: boolean) => void
  setEmotionResult: (text: string) => void
}

export default function CameraButton({
  videoRef,
  canvasRef,
  setIsActive,
}: Props) {
  const [result, setResult] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const { addDailyRecord } = useAuthContext()
  const mapEmotionToColor = (emotion: string): string => {
    const map: Record<string, string> = {
      happy: '#FCD34D',
      sad: '#93C5FD',
      angry: '#FCA5A5',
      neutral: '#D1D5DB',
    }
    return map[emotion] ?? '#D1D5DB'
  }

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
        setStream(s)
        setIsActive(true)
        console.log('✅ カメラ起動')
      }
    } catch (err) {
      console.error('❌ カメラ起動失敗:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    console.log('🛑 カメラ停止')
  }

  const takePhotoAndAnalyze = async () => {


    if (!videoRef.current || !canvasRef.current) return

    const width = videoRef.current.videoWidth
    const height = videoRef.current.videoHeight

    if (width === 0 || height === 0) {
      console.warn('⚠️ カメラが準備できていません')
      return
    }

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
        await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          body: formData,
        })

        const res = await fetch('http://localhost:8000/diagnose')
        const data = await res.json()

        if (data.status === 'success') {
          const emotion = data.emotion

          setResult(`あなたの表情は「${emotion}」です`)
          addDailyRecord(moment().format('YYYY-MM-DD'), {
            emotion: emotion,
            circleColor: mapEmotionToColor(emotion),
          })
        } else {
          setResult(`診断エラー: ${data.message}`)
        }
      } catch (err) {
        console.error('通信エラー:', err)
        setResult('サーバーに接続できませんでした')
      } finally {
        stopCamera() // 撮影後にカメラ停止
      }
    }, 'image/jpeg')
  }

  return (
    <div className='flex flex-col items-center space-y-4 mt-6'>
      <div className='flex gap-4'>
        <button
          onClick={startCamera}
          className='bg-blue-dark text-blue-verylight  px-4 py-2 rounded'
        >
          カメラ起動
        </button>
        <button
          onClick={takePhotoAndAnalyze}
          className='bg-green-600 text-white px-4 py-2 rounded'
        >
          撮影
        </button>
        <button
          onClick={stopCamera}
          className='bg-red-600 text-white px-4 py-2 rounded'
        >
          カメラ停止
        </button>
      </div>
      {result && <p className='mt-4 font-semibold'>{result}</p>}
    </div>
  )
}
