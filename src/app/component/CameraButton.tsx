// app/components/CameraButton.tsx
'use client'

import moment from 'moment'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useAuthContext } from '../context/AuthContext'

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  setIsActive: (active: boolean) => void
  /** 結果は親に一本化（この中では保持しない） */
  setEmotionResult: (text: string | null) => void
  /** サーバーのベースURL（例: http://localhost:8000）。未指定なら相対パス */
  apiBaseUrl?: string
  /** ボタン群のサイズを変えたい時 */
  compact?: boolean
}

/** AbortError 判定（any禁止・型安全） */
function isAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === 'AbortError'
}

export default function CameraButton({
  videoRef,
  canvasRef,
  setIsActive,
  setEmotionResult,
  apiBaseUrl = '',
  compact = false,
}: Props) {
  const { addDailyRecord } = useAuthContext()

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedId, setSelectedId] = useState<string>('')

  const streamRef = useRef<MediaStream | null>(null)
  const startingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  /** カメラ一覧の再検出 */
  const refreshDevices = useCallback(async () => {
    try {
      // 一部ブラウザは権限が無いと label が取れないので、軽く getUserMedia を試す
      try {
        const s0 = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        s0.getTracks().forEach((t) => t.stop())
      } catch {
        /* 権限ダイアログ目的の試行。失敗は無視 */
      }
      const list = await navigator.mediaDevices.enumerateDevices()
      const cams = list.filter((d) => d.kind === 'videoinput')
      setDevices(cams)
      if (cams.length > 0 && !selectedId) setSelectedId(cams[0].deviceId)
    } catch (e) {
      console.error('デバイス列挙に失敗:', e)
    }
  }, [selectedId])

  useEffect(() => {
    refreshDevices()
    const handler = () => refreshDevices()
    navigator.mediaDevices.addEventListener?.('devicechange', handler)
    return () => navigator.mediaDevices.removeEventListener?.('devicechange', handler)
  }, [refreshDevices])

  /** 現在のストリームを確実に停止 */
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    const v = videoRef.current
    if (v) v.srcObject = null
  }, [videoRef])

  /** カメラ起動 */
  const startCamera = useCallback(async () => {
    if (startingRef.current) return
    startingRef.current = true

    const v = videoRef.current
    if (!v) {
      startingRef.current = false
      return
    }

    // HTTPS 以外の注意（localhost はOK）
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
    if (!isSecure) {
      console.warn('⚠️ カメラは https か http://localhost でのみ動作します')
    }

    // 既存をクリア
    stopStream()
    setEmotionResult(null)

    try {
      if (devices.length === 0) {
        await refreshDevices()
      }
      const tries: MediaStreamConstraints[] = [
        selectedId ? { video: { deviceId: { exact: selectedId } }, audio: false } : { video: true, audio: false },
        { video: { facingMode: 'user' }, audio: false },
        { video: { facingMode: 'environment' }, audio: false },
        { video: true, audio: false },
      ]

      let s: MediaStream | null = null
      let lastErr: unknown = null
      for (const c of tries) {
        try {
          s = await navigator.mediaDevices.getUserMedia(c)
          break
        } catch (e) {
          lastErr = e
        }
      }

      if (!s) {
        let hint = ''
        if (lastErr instanceof DOMException && lastErr.name === 'NotAllowedError') {
          hint = '（ブラウザのカメラ権限が拒否されています）'
        } else if (lastErr instanceof DOMException && lastErr.name === 'NotFoundError') {
          hint = '（条件に合うカメラが見つかりません。HTTPS/他アプリ占有を確認）'
        }
        const msg =
          lastErr instanceof DOMException
            ? `カメラ起動に失敗: ${lastErr.name} ${hint}`
            : `カメラ起動に失敗: ${String(lastErr)} ${hint}`
        throw new Error(msg)
      }

      v.srcObject = s
      v.setAttribute('playsinline', '')
      v.muted = true
      v.autoplay = true
      await v.play()

      streamRef.current = s
      setIsActive(true)
    } catch (err: unknown) {
      console.error('❌ カメラ起動失敗:', err)
      setEmotionResult(err instanceof Error ? err.message : 'カメラ起動に失敗しました')
      setIsActive(false)
      stopStream()
    } finally {
      startingRef.current = false
    }
  }, [devices.length, refreshDevices, selectedId, setEmotionResult, setIsActive, stopStream, videoRef])

  /** カメラ停止 */
  const stopCamera = useCallback(() => {
    abortRef.current?.abort()
    stopStream()
    setIsActive(false)
  }, [setIsActive, stopStream])

  /** 画像をサーバーに送り診断 → 結果を親へ渡す */
  const takePhotoAndAnalyze = useCallback(async () => {
    const v = videoRef.current
    const c = canvasRef.current
    if (!v || !c) return

    const width = v.videoWidth
    const height = v.videoHeight
    if (!width || !height) {
      setEmotionResult('⚠️ カメラが準備できていません')
      return
    }

    c.width = width
    c.height = height
    const ctx = c.getContext('2d')
    if (!ctx) {
      setEmotionResult('キャンバスが利用できません')
      return
    }
    ctx.drawImage(v, 0, 0, width, height)

    // Blob を await 化
    const blob: Blob | null = await new Promise((resolve) =>
      c.toBlob((b) => resolve(b), 'image/jpeg'),
    )
    if (!blob) {
      setEmotionResult('画像の取得に失敗しました')
      return
    }

    const formData = new FormData()
    formData.append('file', blob, 'capture.jpg')

    const controller = new AbortController()
    abortRef.current = controller
    const base = apiBaseUrl.replace(/\/$/, '') // 末尾スラッシュ除去
    const analyzeUrl = `${base}/analyze`
    const diagnoseUrl = `${base}/diagnose`

    try {
      // 送信
      const r1 = await fetch(analyzeUrl, { method: 'POST', body: formData, signal: controller.signal })
      if (!r1.ok) throw new Error(`analyze失敗 (${r1.status})`)

      // 診断取得
      const r2 = await fetch(diagnoseUrl, { signal: controller.signal })
      if (!r2.ok) throw new Error(`diagnose失敗 (${r2.status})`)

      const data: unknown = await r2.json()
      if (
        typeof data === 'object' &&
        data !== null &&
        'status' in data &&
        (data as { status: unknown }).status === 'success' &&
        'emotion' in data &&
        typeof (data as { emotion: unknown }).emotion === 'string'
      ) {
        const emotion = (data as { emotion: string }).emotion
        const text = `あなたの表情は「${emotion}」です`
        setEmotionResult(text)
        // 任意: 今日の日付に結果を保存
        addDailyRecord(moment().format('YYYY-MM-DD'), { emotion })
      } else {
        const msg =
          typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string'
            ? (data as { message: string }).message
            : 'unknown'
        setEmotionResult(`診断エラー: ${msg}`)
      }
    } catch (err: unknown) {
      if (isAbortError(err)) {
        // キャンセル時は何もしない
      } else {
        console.error('通信エラー:', err)
        setEmotionResult('サーバーに接続できませんでした')
      }
    } finally {
      abortRef.current = null
      // 撮影後は止める（要件に合わせて外してOK）
      stopCamera()
    }
  }, [addDailyRecord, apiBaseUrl, canvasRef, setEmotionResult, stopCamera, videoRef])

  const pad = compact ? 'px-2 py-1 text-sm' : 'px-4 py-2'

  return (
    <div className='flex flex-col items-center space-y-4 mt-6'>
      <div className='flex gap-2 flex-wrap items-center'>
        <select
          className={`border rounded ${pad}`}
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

        <button onClick={refreshDevices} className={`border rounded ${pad}`}>
          再検出
        </button>

        <button
          onClick={startCamera}
          className={`bg-blue-600 text-white rounded ${pad}`}
          title='カメラを起動'
        >
          カメラ起動
        </button>

        <button
          onClick={takePhotoAndAnalyze}
          className={`bg-green-600 text-white rounded ${pad}`}
          title='撮影して診断'
        >
          撮影
        </button>

        <button
          onClick={stopCamera}
          className={`bg-rose-600 text-white rounded ${pad}`}
          title='カメラ停止'
        >
          カメラ停止
        </button>
      </div>
      {/* 結果の表示は親に一本化。ここでは描かない */}
    </div>
  )
}
