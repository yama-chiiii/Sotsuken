'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type DiagnosisResult = {
  date: string
  result: string
}

export default function HistoryPage() {
  const [mentalResults, setMentalResults] = useState<DiagnosisResult[]>([])
  const [actionResults, setActionResults] = useState<DiagnosisResult[]>([])

  useEffect(() => {
    const mental = JSON.parse(localStorage.getItem('diagnosis_mental') || '[]')
    const action = JSON.parse(localStorage.getItem('diagnosis_action') || '[]')
    setMentalResults(mental)
    setActionResults(action)
  }, [])

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100 p-12 font-mPlus'>
      <div className='w-full md:w-1/2 flex flex-col items-center bg-white p-8 rounded-lg shadow-md font-mPlus'>
        <h1 className='mt-64 mx-36 text-xl sm:text-2xl font-semibold'>
          回答記録
        </h1>
        <section className='mx-24 my-24'>
          <h2 className='text-2xl font-semibold mb-4 text-pink-dark'>
            メンタル編
          </h2>
          {mentalResults.length > 0 ? (
            <ul className='space-y-4'>
              {mentalResults.map((r, i) => (
                <li key={i} className='my-8 border p-8 rounded bg-gray-50'>
                  <div className='mb-8 border-b-2 border-pink-dark font-bold'>記録{i+1}</div>
                  <div className='text-sm text-gray-500'>{r.date}</div>
                  <div className='mt-2'>{r.result}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-500'>記録がありません。</p>
          )}
        </section>

        <section className='mx-24 my-24'>
          <h2 className='text-2xl font-semibold mb-4 text-blue-dark'>行動編</h2>
          {actionResults.length > 0 ? (
            <ul className='space-y-4'>
              {actionResults.map((r, i) => (
                <li key={i} className='my-8 border p-8 rounded bg-gray-50'>
                  <div className='mb-8 border-b-2 border-blue-dark font-bold'>記録{i+1}</div>
                  <div className='text-sm text-gray-500'>{r.date}</div>
                  <div className='mt-2'>{r.result}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-500'>記録がありません。</p>
          )}
        </section>
      </div>
      <Link
        href={'/'}
        className='w-1/4 my-40 py-12 text-xl font-semibold rounded text-center bg-pink hover:bg-pink-dark text-white'
      >
        <button>ホームにもどる</button>
      </Link>
    </div>
  )
}
