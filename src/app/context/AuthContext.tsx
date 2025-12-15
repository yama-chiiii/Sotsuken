// app/context/AuthContext.tsx
'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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

interface AuthContextType {
  loading: boolean
  sliderValue: number
  circleColor: string
  selectedTags: string[]
  memo: string
  tag1: string | null
  tag2: string | null
  dailyRecords: Record<string, DailyRecord>
  todayWeather: DailyRecord['weather'] | null

  setSliderValue: React.Dispatch<React.SetStateAction<number>>
  setCircleColor: React.Dispatch<React.SetStateAction<string>>
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  setMemo: React.Dispatch<React.SetStateAction<string>>
  setTag1: React.Dispatch<React.SetStateAction<string | null>>
  setTag2: React.Dispatch<React.SetStateAction<string | null>>
  setDailyRecords: React.Dispatch<
    React.SetStateAction<Record<string, DailyRecord>>
  >

  setTodayWeather: (w: DailyRecord['weather']) => void

  addDailyRecord: (date: string, data: Partial<DailyRecord>) => Promise<void>
  updateEmotion: (date: string, emotion: string) => Promise<void>
}

// --------------- Constants ---------------
const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INITIAL_DATA = {
  sliderValue: 3,
  circleColor: '#F2F2F2',
  selectedTags: [] as string[],
  memo: '',
  tag1: null as string | null,
  tag2: null as string | null,
  dailyRecords: {} as Record<string, DailyRecord>,

}

const dateKey = (d = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d)

// --------------- Provider ----------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sliderValue, setSliderValue] = useState(INITIAL_DATA.sliderValue)
  const [circleColor, setCircleColor] = useState(INITIAL_DATA.circleColor)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    INITIAL_DATA.selectedTags,
  )
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyRecord>>(
    INITIAL_DATA.dailyRecords,
  )
  const [memo, setMemo] = useState(INITIAL_DATA.memo)
  const [tag1, setTag1] = useState<string | null>(INITIAL_DATA.tag1)
  const [tag2, setTag2] = useState<string | null>(INITIAL_DATA.tag2)
  const [loading, setLoading] = useState(true)
  const [todayKey, setTodayKey] = useState<string>(dateKey())

  // ⭐ Weather 保存用 state
  const [todayWeather, setTodayWeather] = useState<
    DailyRecord['weather'] | null
  >(null)

  // refs
  const userIdRef = useRef<string | null>(null)
  const dailyRecordsRef = useRef<Record<string, DailyRecord>>({})

  useEffect(() => {
    dailyRecordsRef.current = dailyRecords
  }, [dailyRecords])

  const cleanPartial = (data: Partial<DailyRecord>) =>
    Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as
      Partial<DailyRecord>

  // ⭐ DailyRecord（部分更新）+ weather 統合
  const addDailyRecord = useCallback(
    async (date: string, data: Partial<DailyRecord>) => {
      const clean = cleanPartial(data)

      const full: Partial<DailyRecord> = {
        ...clean,
        weather: clean.weather ?? todayWeather ?? undefined,
      }

      setDailyRecords(prev => ({
        ...prev,
        [date]: { ...(prev[date] ?? {}), ...full },
      }))

      const uid = userIdRef.current
      if (!uid) return
      const current = dailyRecordsRef.current[date] ?? {}
      const merged: DailyRecord = { ...current, ...full }
      await setDoc(
        doc(db, 'users', uid),
        { dailyRecords: { [date]: merged } },
        { merge: true },
      )
    },
    [todayWeather],
  )

  const updateEmotion = useCallback(
    async (date: string, emotion: string) => {
      setDailyRecords(prev => ({
        ...prev,
        [date]: { ...(prev[date] ?? {}), emotion },
      }))

      const uid = userIdRef.current
      if (!uid) return
      const current = dailyRecordsRef.current[date] ?? {}
      const merged: DailyRecord = { ...current, emotion }
      await setDoc(
        doc(db, 'users', uid),
        { dailyRecords: { [date]: merged } },
        { merge: true },
      )
    },
    [],
  )

  // 日付切り替え時の UI リセット
  useEffect(() => {
    const tick = () => {
      const now = dateKey()
      if (now !== todayKey) {
        setTodayKey(now)
        setSliderValue(INITIAL_DATA.sliderValue)
        setCircleColor(INITIAL_DATA.circleColor)
        setSelectedTags(INITIAL_DATA.selectedTags)
        setMemo(INITIAL_DATA.memo)
        setTag1(INITIAL_DATA.tag1)
        setTag2(INITIAL_DATA.tag2)
        setTodayWeather(null)
      }
    }
    const id = setInterval(tick, 60000)
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

  const syncTopLevelToFirestore = useCallback(
    async (uid: string) => {
      const userDocRef = doc(db, 'users', uid)
      const topLevel = {
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        tag1,
        tag2,
      }
      try {
        await setDoc(userDocRef, topLevel, { merge: true })
      } catch (error) {
        console.error('Firestore へのトップレベル同期に失敗:', error)
      }
    },
    [sliderValue, circleColor, selectedTags, memo, tag1, tag2],
  )

  // 初期ロード
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        userIdRef.current = user.uid
        const userDocRef = doc(db, 'users', user.uid)
        const snap = await getDoc(userDocRef)

        if (snap.exists()) {
          const data = snap.data() as Partial<{
            sliderValue: number
            circleColor: string
            selectedTags: string[]
            memo: string
            tag1: string | null
            tag2: string | null
            dailyRecords: Record<string, DailyRecord>
          }>
          setSliderValue(data.sliderValue ?? INITIAL_DATA.sliderValue)
          setCircleColor(data.circleColor ?? INITIAL_DATA.circleColor)
          setSelectedTags(data.selectedTags ?? INITIAL_DATA.selectedTags)
          setMemo(data.memo ?? INITIAL_DATA.memo)
          setTag1(data.tag1 ?? INITIAL_DATA.tag1)
          setTag2(data.tag2 ?? INITIAL_DATA.tag2)
          setDailyRecords(data.dailyRecords ?? INITIAL_DATA.dailyRecords)
        } else {
          await setDoc(userDocRef, INITIAL_DATA, { merge: true })
          setDailyRecords(INITIAL_DATA.dailyRecords)
        }
      } else {
        userIdRef.current = null
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const uid = userIdRef.current
    if (uid) {
      void syncTopLevelToFirestore(uid)
    }
  }, [syncTopLevelToFirestore])

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
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}
