'use client'

import moment from 'moment'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'

type DiagnosisResult = {
  date: string //
  result: string
}

type DailyRecord = {
  mentalResult?: string
  actionResult?: string
}

export default function HistoryPage() {
  const { dailyRecords } = useAuthContext()
  const [lsMental, setLsMental] = useState<DiagnosisResult[]>([])
  const [lsAction, setLsAction] = useState<DiagnosisResult[]>([])

  useEffect(() => {
    try {
      const mental = JSON.parse(localStorage.getItem('diagnosis_mental') || '[]')
      const action = JSON.parse(localStorage.getItem('diagnosis_action') || '[]')
      setLsMental(Array.isArray(mental) ? mental : [])
      setLsAction(Array.isArray(action) ? action : [])
    } catch {
      setLsMental([])
      setLsAction([])
    }
  }, [])

  // コンテキスト → DiagnosisResult[] へ変換
  const records = dailyRecords as Record<string, DailyRecord>

  const ctxMental: DiagnosisResult[] = useMemo(() => {
    return Object.entries(records).flatMap(([date, rec]) => {
      if (rec?.mentalResult) {
        const d = moment(date).format('YYYY-MM-DD')
        return [{ date: d, result: rec.mentalResult }]
      }
      return []
    })
  }, [records])

  const ctxAction: DiagnosisResult[] = useMemo(() => {
    return Object.entries(records).flatMap(([date, rec]) => {
      if (rec?.actionResult) {
        const d = moment(date).format('YYYY-MM-DD')
        return [{ date: d, result: rec.actionResult }]
      }
      return []
    })
  }, [records])

  const mergeUnique = (a: DiagnosisResult[], b: DiagnosisResult[]) => {
    const map = new Map<string, DiagnosisResult>()
    for (const r of [...a, ...b]) {
      const key = `${moment(r.date).format('YYYY-MM-DD')}::${r.result}`
      if (!map.has(key)) map.set(key, { ...r, date: moment(r.date).format('YYYY-MM-DD') })
    }
    // 新しい順に
    return Array.from(map.values()).sort((x, y) => (x.date < y.date ? 1 : -1))
  }

  const mentalResults = useMemo(() => mergeUnique(ctxMental, lsMental), [ctxMental, lsMental])
  const actionResults = useMemo(() => mergeUnique(ctxAction, lsAction), [ctxAction, lsAction])

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-blue-100 p-12 font-mPlus">
      <div className="w-full md:w-1/2 flex flex-col items-center bg-white p-8 rounded-lg shadow-md font-mPlus">
        <h1 className="mt-64 mx-36 text-xl sm:text-2xl font-semibold">回答記録</h1>

        <section className="mx-24 my-24">
          <h2 className="text-2xl font-semibold mb-4 text-pink-dark">メンタル編</h2>
          {mentalResults.length > 0 ? (
            <ul className="space-y-4">
              {mentalResults.map((r, i) => (
                <li key={`${r.date}-${i}`} className="my-8 border p-8 rounded bg-gray-50">
                  <div className="mb-8 border-b-2 border-pink-dark font-bold">記録{i + 1}</div>
                  <div className="text-sm text-gray-500">{r.date}</div>
                  <div className="mt-2 whitespace-pre-wrap break-words">{r.result}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">記録がありません。</p>
          )}
        </section>

        <section className="mx-24 my-24">
          <h2 className="text-2xl font-semibold mb-4 text-blue-dark">行動編</h2>
          {actionResults.length > 0 ? (
            <ul className="space-y-4">
              {actionResults.map((r, i) => (
                <li key={`${r.date}-${i}`} className="my-8 border p-8 rounded bg-gray-50">
                  <div className="mb-8 border-b-2 border-blue-dark font-bold">記録{i + 1}</div>
                  <div className="text-sm text-gray-500">{r.date}</div>
                  <div className="mt-2 whitespace-pre-wrap break-words">{r.result}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">記録がありません。</p>
          )}
        </section>
      </div>

      {/* Link内にbuttonを入れず、Link自体をボタン風に */}
      <Link
        href="/"
        className="w-1/4 my-40 py-12 text-xl font-semibold rounded text-center bg-pink hover:bg-pink-dark text-white"
      >
        ホームにもどる
      </Link>
    </div>
  )
}
