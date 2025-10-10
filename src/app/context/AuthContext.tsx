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

  setSliderValue: React.Dispatch<React.SetStateAction<number>>
  setCircleColor: React.Dispatch<React.SetStateAction<string>>
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  setMemo: React.Dispatch<React.SetStateAction<string>>
  setTag1: React.Dispatch<React.SetStateAction<string | null>>
  setTag2: React.Dispatch<React.SetStateAction<string | null>>
  setDailyRecords: React.Dispatch<
    React.SetStateAction<Record<string, DailyRecord>>
  >

  /** 汎用：日別データを “部分更新” して Firestore にも反映 */
  addDailyRecord: (date: string, data: Partial<DailyRecord>) => Promise<void>
  /** 顔診断専用：emotion だけを安全に更新（既存の他フィールドを保持） */
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

  /** 現在のユーザーIDと最新の dailyRecords を参照するための ref */
  const userIdRef = useRef<string | null>(null)
  const dailyRecordsRef = useRef<Record<string, DailyRecord>>({})

  useEffect(() => {
    dailyRecordsRef.current = dailyRecords
  }, [dailyRecords])

  /** undefined を除去してから保存するヘルパー */
  const cleanPartial = (data: Partial<DailyRecord>) =>
    Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as
      Partial<DailyRecord>

  /** ローカル部分更新 + Firestore を当日キーだけマージ更新 */
  const addDailyRecord = useCallback(
    async (date: string, data: Partial<DailyRecord>) => {
      const clean = cleanPartial(data)

      // ① ローカルをマージ
      setDailyRecords(prev => ({
        ...prev,
        [date]: { ...(prev[date] ?? {}), ...clean },
      }))

      // ② Firestore：対象日のキーだけ差し替え（他の日は保持）
      const uid = userIdRef.current
      if (!uid) return
      const current = dailyRecordsRef.current[date] ?? {}
      const merged: DailyRecord = { ...current, ...clean }
      await setDoc(
        doc(db, 'users', uid),
        { dailyRecords: { [date]: merged } },
        { merge: true },
      )
    },
    [],
  )

  /** 顔診断の emotion だけを安全に更新 */
  const updateEmotion = useCallback(
    async (date: string, emotion: string) => {
      // ① ローカル
      setDailyRecords(prev => ({
        ...prev,
        [date]: { ...(prev[date] ?? {}), emotion },
      }))

      // ② Firestore（対象日のみ）
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

  /** 日付が変わったら “編集中フィールドのみ” を初期化（dailyRecords は保持） */
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

  /** トップレベルの設定だけを同期（dailyRecords はここでは送らない） */
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

  /** 初期ロード（ログイン状態の監視と初回データ読み込み） */
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
          // ドキュメントがなければ初期化
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

  /** トップレベルの値が変わったらのみ同期（dailyRecords は個別関数で保存） */
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
        setSliderValue,
        setCircleColor,
        setSelectedTags,
        setMemo,
        setTag1,
        setTag2,
        setDailyRecords,
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
