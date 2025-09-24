'use client'

import moment from 'moment'
import { RefObject, useEffect, useState } from 'react'
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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedId, setSelectedId] = useState<string>('')

  // デバイス再検出（権限が必要なブラウザが多い）
  const refreshDevices = async () => {
    try {
      // まず緩い取得で権限ダイアログを出す（取れなくても無視）
      try {
        const s0 = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        s0.getTracks().forEach((t) => t.stop())
      } catch {}
      const list = await navigator.mediaDevices.enumerateDevices()
      const cams = list.filter((d) => d.kind === 'videoinput')
      setDevices(cams)
      if (cams.length > 0 && !selectedId) setSelectedId(cams[0].deviceId)
      console.log(
        '[cams]',
        cams.map((c) => ({ label: c.label, id: c.deviceId })),
      )
    } catch (e) {
      console.error('デバイス列挙に失敗:', e)
    }
  }

  useEffect(() => {
    // 初回に一度だけ検出
    refreshDevices()
    // デバイスの抜き差しに追従
    const handler = () => refreshDevices()
    navigator.mediaDevices.addEventListener?.('devicechange', handler)
    return () =>
      navigator.mediaDevices.removeEventListener?.('devicechange', handler)
  }, [])

  const startCamera = async () => {
    // 既存のストリームが残っていると NotFound/NotReadable を誘発
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
      if (videoRef.current) videoRef.current.srcObject = null
    }
    const isSecure =
      location.protocol === 'https:' || location.hostname === 'localhost'
    if (!isSecure)
      console.warn('⚠️ カメラは https か http://localhost でのみ動作')
    try {
      if (devices.length === 0) {
        await refreshDevices()
      }
      let s: MediaStream | null = null
      let lastErr: unknown = null
      const tries: MediaStreamConstraints[] = [
        selectedId
          ? { video: { deviceId: { exact: selectedId } }, audio: false }
          : { video: true, audio: false },
        { video: { facingMode: 'user' }, audio: false },
        { video: { facingMode: 'environment' }, audio: false },
        { video: true, audio: false },
      ]
      for (const c of tries) {
        try {
          s = await navigator.mediaDevices.getUserMedia(c)
          break
        } catch (e) {
          lastErr = e
        }
      }
      if (!s) {
        const hint =
          lastErr instanceof DOMException && lastErr.name === 'NotAllowedError'
            ? '（ブラウザのカメラ権限が拒否されています）'
            : lastErr instanceof DOMException &&
              lastErr.name === 'NotFoundError'
            ? '（条件に合うカメラが見つかりません。HTTPS/他アプリ占有を確認）'
            : ''
        if (lastErr instanceof DOMException) {
          throw new Error(`カメラ起動に失敗: ${lastErr.name} ${hint}`)
        }
        throw new Error(`カメラ起動に失敗: ${String(lastErr)} ${hint}`)
      }
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play()
      }
      setStream(s)
      setIsActive(true)
      console.log('✅ カメラ起動')
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('❌ カメラ起動失敗:', err)
        alert(err.message)
      } else {
        console.error('❌ カメラ起動失敗:', err)
        alert('カメラ起動に失敗しました')
      }
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
          addDailyRecord(moment().format('YYYY-MM-DD'), { emotion })
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
        <select
          className='border rounded px-2 py-1'
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          title='使用するカメラ'
        >
          {devices.length === 0 && <option value=''>カメラ未検出</option>}
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `カメラ (${d.deviceId.slice(0, 6)}…)`}
            </option>
          ))}
        </select>
        <button onClick={refreshDevices} className='border px-2 rounded'>
          再検出
        </button>
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
