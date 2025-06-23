'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { auth, db } from '../firebaseConfig'

export interface DailyRecord {
  sliderValue?: number
  selectedTags?: string[]
  memo?: string
  circleColor?: string
  emotion?: string // 表情データ
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
  addDailyRecord: (date: string, data: Partial<DailyRecord>) => void // ⭐️ 追加
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INITIAL_DATA = {
  sliderValue: 3,
  circleColor: '#F2F2F2',
  selectedTags: [],
  memo: '',
  tag1: null,
  tag2: null,
  dailyRecords: {} as Record<string, DailyRecord>,
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sliderValue, setSliderValue] = useState(INITIAL_DATA.sliderValue)
  const [circleColor, setCircleColor] = useState(INITIAL_DATA.circleColor)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    INITIAL_DATA.selectedTags,
  )
  const [dailyRecords, setDailyRecords] = useState(INITIAL_DATA.dailyRecords)
  const [memo, setMemo] = useState(INITIAL_DATA.memo)
  const [tag1, setTag1] = useState<string | null>(INITIAL_DATA.tag1)
  const [tag2, setTag2] = useState<string | null>(INITIAL_DATA.tag2)
  const [loading, setLoading] = useState(true)

  const addDailyRecord = useCallback(
    (date: string, data: Partial<DailyRecord>) => {
      setDailyRecords((prev) => ({
        ...prev,
        [date]: { ...(prev[date] ?? {}), ...data },
      }))
    },
    [],
  )

  // Firestoreにデータを同期
  const syncDataToFirestore = useCallback(
    async (userId: string) => {
      const userDocRef = doc(db, 'users', userId)
      const userData = {
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        tag1,
        tag2,
        dailyRecords,
      }

      try {
        await setDoc(userDocRef, userData, { merge: true }) // データをFirestoreに同期
      } catch (error) {
        console.error('Firestoreへのデータ同期に失敗しました:', error)
      }
    },
    [sliderValue, circleColor, selectedTags, memo, tag1, tag2, dailyRecords],
  )

  // Firestoreからデータを取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          setSliderValue(userData.sliderValue ?? INITIAL_DATA.sliderValue)
          setCircleColor(userData.circleColor ?? INITIAL_DATA.circleColor)
          setSelectedTags(userData.selectedTags ?? INITIAL_DATA.selectedTags)
          setMemo(userData.memo ?? INITIAL_DATA.memo)
          setTag1(userData.tag1 ?? INITIAL_DATA.tag1)
          setTag2(userData.tag2 ?? INITIAL_DATA.tag2)
          setDailyRecords(userData.dailyRecords ?? INITIAL_DATA.dailyRecords)
        } else {
          // Firestoreに初期データを保存
          const initialData = {
            ...INITIAL_DATA,
          }
          await setDoc(userDocRef, initialData)
          setDailyRecords(initialData.dailyRecords)
        }
      }
      setLoading(false) // データ取得完了後にローディングを解除
    })

    return () => unsubscribe()
  }, [])

  // 状態が変更されるたびにFirestoreにデータを同期
  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      syncDataToFirestore(user.uid)
    }
  }, [syncDataToFirestore])

  return (
    <AuthContext.Provider
      value={{
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
        addDailyRecord,
        setDailyRecords,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
