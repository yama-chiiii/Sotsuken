// app/context/AuthContext.tsx
'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { auth, db } from '../firebaseConfig'

// ---------------- Types ----------------
export interface DailyRecord {
  sliderValue?: number
  selectedTags?: string[]
  memo?: string
  circleColor?: string
  emotion?: string
  weather?: {
    description: string
    temp: number
    pressure: number
    humidity: number
    condition: string
  }
}

export type FirestoreUserDoc = {
  sliderValue: number
  circleColor: string
  selectedTags: string[]
  memo: string
  tag1: string | null
  tag2: string | null
  dailyRecords: Record<string, DailyRecord>
}

export type FirestoreUserDocPartial = Partial<FirestoreUserDoc>

interface AuthContextType {
  loading: boolean

  // top-level state
  sliderValue: number
  circleColor: string
  selectedTags: string[]
  memo: string
  tag1: string | null
  tag2: string | null

  // date key
  todayKey: string

  // records
  dailyRecords: Record<string, DailyRecord>
  todayWeather: DailyRecord['weather'] | null

  // setters
  setSliderValue: React.Dispatch<React.SetStateAction<number>>
  setCircleColor: React.Dispatch<React.SetStateAction<string>>
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  setMemo: React.Dispatch<React.SetStateAction<string>>
  setTag1: React.Dispatch<React.SetStateAction<string | null>>
  setTag2: React.Dispatch<React.SetStateAction<string | null>>
  setDailyRecords: React.Dispatch<React.SetStateAction<Record<string, DailyRecord>>>

  setTodayWeather: (w: DailyRecord['weather']) => void

  // actions
  addDailyRecord: (date: string, data: Partial<DailyRecord>) => Promise<void>
  updateEmotion: (date: string, emotion: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INITIAL_USER_DOC: FirestoreUserDoc = {
  sliderValue: 3,
  circleColor: '#F2F2F2',
  selectedTags: [],
  memo: '',
  tag1: null,
  tag2: null,
  dailyRecords: {},
}

const dateKey = (d = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d)

// ---------------- Provider ----------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // top-level state
  const [sliderValue, setSliderValue] = useState(INITIAL_USER_DOC.sliderValue)
  const [circleColor, setCircleColor] = useState(INITIAL_USER_DOC.circleColor)
  const [selectedTags, setSelectedTags] = useState<string[]>(INITIAL_USER_DOC.selectedTags)
  const [memo, setMemo] = useState(INITIAL_USER_DOC.memo)
  const [tag1, setTag1] = useState<string | null>(INITIAL_USER_DOC.tag1)
  const [tag2, setTag2] = useState<string | null>(INITIAL_USER_DOC.tag2)

  // records
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(INITIAL_USER_DOC.dailyRecords)

  // flags
  const [loading, setLoading] = useState(true)
  const didInitialLoadRef = useRef(false)

  // current user uid
  const userIdRef = useRef<string | null>(null)

  // today key
  const [todayKey, setTodayKey] = useState<string>(dateKey())

  // weather cache for today
  const [todayWeather, setTodayWeather] = useState<DailyRecord['weather'] | null>(null)

  const cleanPartial = useCallback((data: Partial<DailyRecord>) => {
    return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Partial<DailyRecord>
  }, [])

  const applyUserDocToState = useCallback((raw: FirestoreUserDocPartial) => {
    setSliderValue(raw.sliderValue ?? INITIAL_USER_DOC.sliderValue)
    setCircleColor(raw.circleColor ?? INITIAL_USER_DOC.circleColor)
    setSelectedTags(raw.selectedTags ?? [])
    setMemo(raw.memo ?? INITIAL_USER_DOC.memo)
    setTag1(raw.tag1 ?? null)
    setTag2(raw.tag2 ?? null)
    setDailyRecords(raw.dailyRecords ?? {})
  }, [])

  /**
   * Firestore の users/{uid} は必ず存在させる（updateDoc が落ちるのを防ぐ）
   */
  const ensureUserDoc = useCallback(async (uid: string) => {
    const ref = doc(db, 'users', uid)
    await setDoc(ref, INITIAL_USER_DOC, { merge: true })
  }, [])

  /**
   * dailyRecords[date] の空オブジェクトだけ先に作る
   * - dot path update を安定させる
   */
  const ensureDailyRecordSkeleton = useCallback(async (uid: string, date: string) => {
    const ref = doc(db, 'users', uid)
    await setDoc(ref, { dailyRecords: { [date]: {} } }, { merge: true })
  }, [])

  /**
   * DailyRecord の「必要なフィールドだけ」を dot path で更新する
   * - これにより、mood 等の他フィールドが消える事故を防ぐ（P1-3）
   */
  const patchDailyRecord = useCallback(
    async (uid: string, date: string, partial: Partial<DailyRecord>) => {
      const clean = cleanPartial(partial)
      if (Object.keys(clean).length === 0) return

      const ref = doc(db, 'users', uid)

      const patch: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(clean)) {
        if (v === undefined) continue
        patch[`dailyRecords.${date}.${k}`] = v
      }

      if (Object.keys(patch).length === 0) return

      try {
        await updateDoc(ref, patch)
      } catch {
        // user doc or date skeleton が無いケースの保険
        await ensureUserDoc(uid)
        await ensureDailyRecordSkeleton(uid, date)
        await updateDoc(ref, patch)
      }
    },
    [cleanPartial, ensureDailyRecordSkeleton, ensureUserDoc],
  )

  // ⭐ DailyRecord（部分更新）+ weather 統合（マージ）
  const addDailyRecord = useCallback(
    async (date: string, data: Partial<DailyRecord>) => {
      const uid = userIdRef.current
      if (!uid) return

      const clean = cleanPartial(data)
      const full: Partial<DailyRecord> = {
        ...clean,
        weather: clean.weather ?? todayWeather ?? undefined,
      }

      // --- local state: merged（UIは即反映） ---
      setDailyRecords(prev => {
        const merged: DailyRecord = { ...(prev[date] ?? {}), ...full }
        return { ...prev, [date]: merged }
      })

      // --- firestore: dot path patch only（事故防止） ---
      await patchDailyRecord(uid, date, full)
    },
    [cleanPartial, patchDailyRecord, todayWeather],
  )

  const updateEmotion = useCallback(
    async (date: string, emotion: string) => {
      const uid = userIdRef.current
      if (!uid) return

      // local state
      setDailyRecords(prev => {
        const merged: DailyRecord = { ...(prev[date] ?? {}), emotion }
        return { ...prev, [date]: merged }
      })

      // firestore: dot path only
      await patchDailyRecord(uid, date, { emotion })
    },
    [patchDailyRecord],
  )

  // 日付切り替え時の UI リセット（0時跨ぎ＋復帰）
  useEffect(() => {
    const tick = () => {
      const now = dateKey()
      if (now !== todayKey) {
        setTodayKey(now)

        // UIの「今日入力」をリセット（必要ならここを調整）
        setSliderValue(INITIAL_USER_DOC.sliderValue)
        setCircleColor(INITIAL_USER_DOC.circleColor)
        setSelectedTags([])
        setMemo(INITIAL_USER_DOC.memo)
        setTag1(INITIAL_USER_DOC.tag1)
        setTag2(INITIAL_USER_DOC.tag2)
        setTodayWeather(null)
      }
    }

    const id = setInterval(tick, 60_000)
    tick()

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [todayKey])

  /**
   * top-level を Firestore に同期（必要最低限）
   * - 初期ロード直後の「古い値での上書き」を防ぐため、didInitialLoadRef を見る
   * - loading が false かつ uid がある時だけ
   */
  const topLevelForDb = useMemo(
    () => ({
      sliderValue,
      circleColor,
      selectedTags,
      memo,
      tag1,
      tag2,
    }),
    [sliderValue, circleColor, selectedTags, memo, tag1, tag2],
  )

  const syncTopLevelToFirestore = useCallback(
    async (uid: string) => {
      try {
        await setDoc(doc(db, 'users', uid), topLevelForDb, { merge: true })
      } catch (error) {
        console.error('Firestore へのトップレベル同期に失敗:', error)
      }
    },
    [topLevelForDb],
  )

  // 初期ロード（Auth確定 → Firestore取得 → state反映 → loading解除）
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      try {
        if (user) {
          userIdRef.current = user.uid
          const userDocRef = doc(db, 'users', user.uid)
          const snap = await getDoc(userDocRef)

          if (snap.exists()) {
            const raw = snap.data() as FirestoreUserDocPartial
            applyUserDocToState(raw)
          } else {
            await setDoc(userDocRef, INITIAL_USER_DOC, { merge: true })
            applyUserDocToState(INITIAL_USER_DOC)
          }

          didInitialLoadRef.current = true
        } else {
          userIdRef.current = null
          didInitialLoadRef.current = true
        }
      } catch (e) {
        console.error('AuthContext 初期ロード失敗:', e)
      } finally {
        setLoading(false) // ★絶対に解除
      }
    })

    return () => unsubscribe()
  }, [applyUserDocToState])

  // top-level 同期（初期ロード完了後のみ）
  useEffect(() => {
    const uid = userIdRef.current
    if (!uid) return
    if (loading) return
    if (!didInitialLoadRef.current) return

    void syncTopLevelToFirestore(uid)
  }, [loading, syncTopLevelToFirestore])

  return (
    <AuthContext.Provider
      value={{
        loading,
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        tag1,
        tag2,
        todayKey,
        dailyRecords,
        todayWeather,
        setSliderValue,
        setCircleColor,
        setSelectedTags,
        setMemo,
        setTag1,
        setTag2,
        setDailyRecords,
        setTodayWeather,
        addDailyRecord,
        updateEmotion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// --------------- Hook ----------------
export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}
