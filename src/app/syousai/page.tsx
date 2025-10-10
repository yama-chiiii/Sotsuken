'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Slider from '../component/Slider'
import { useAuthContext, type DailyRecord } from '../context/AuthContext'

export default function Syousai() {
  const DEFAULT_SYOUSAI_GRAY = '#F2F2F2'

  const {
    dailyRecords,
    addDailyRecord,
    sliderValue,
    setSliderValue,
    selectedTags,
    setSelectedTags,
    circleColor,
    setCircleColor,
    memo,
    setMemo,
    tag1,
    setTag1,
    tag2,
    setTag2,
  } = useAuthContext()
  const router = useRouter()

  const dateKey = () =>
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
      new Date(),
    )
  const today = dateKey()

  useEffect(() => {
    const defaults: DailyRecord = {
      sliderValue: 3,
      selectedTags: [],
      memo: '',
      circleColor: '#F2F2F2',
    }
    const recs = (dailyRecords ?? {}) as Record<string, Partial<DailyRecord>>
    const raw = recs[today] ?? {}
    const todayData: DailyRecord = {
      sliderValue: raw.sliderValue ?? defaults.sliderValue,
      selectedTags: raw.selectedTags ?? defaults.selectedTags,
      memo: raw.memo ?? defaults.memo,
      circleColor: raw.circleColor ?? defaults.circleColor,
    }
    setSliderValue(todayData.sliderValue ?? 0)
    setSelectedTags(todayData.selectedTags ?? [])
    setMemo(todayData.memo ?? '')
    setCircleColor(todayData.circleColor ?? '#F2F2F2')
    setTag1(todayData.selectedTags?.[0] ?? null)
    setTag2(todayData.selectedTags?.[1] ?? null)
  }, [
    dailyRecords,
    setSliderValue,
    setSelectedTags,
    setMemo,
    setCircleColor,
    setTag1,
    setTag2,
    today,
  ])

  const handleTag1Click = (tag: string) => {
    if (tag1 === tag) {
      setTag1(null) // 選択解除
      setSelectedTags((prev: string[]) => prev.filter((t) => t !== tag))
    } else {
      setTag1(tag) // 新たに選択
      setSelectedTags((prev: string[]) =>
        prev.includes(tag) ? prev : [...prev, tag],
      )
    }
  }

  const handleTag2Click = (tag: string) => {
    if (tag2 === tag) {
      setTag2(null)
      setSelectedTags((prev: string[]) => prev.filter((t) => t !== tag))
    } else {
      setTag2(tag)
      setSelectedTags((prev: string[]) =>
        prev.includes(tag) ? prev : [...prev, tag],
      )
    }
  }

  const handleSave = () => {
    const newRecord: Partial<DailyRecord> = {
      sliderValue,
      selectedTags,
      memo,
    }
    // ← 既定の灰色(#F2F2F2)は“未設定扱い”にして保存しない
    if (circleColor && circleColor.toLowerCase() !== DEFAULT_SYOUSAI_GRAY.toLowerCase()) {
      newRecord.circleColor = circleColor
    }
    addDailyRecord(today, newRecord)
    alert('保存しました！')
    router.push('/')
  }

  const tagsNow = [
    '#健康',
    '#不健康',
    '#快適',
    '#良好',
    '#普通',
    '#無関心',
    '#不快',
  ]
  const tagsInfluence = [
    '#体調',
    '#睡眠',
    '#人間関係',
    '#ストレス',
    '#天候',
    '#趣味',
    '#タスク',
    '#その他',
  ]

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>
        <div className='w-full mt-36 flex flex-col items-center'>
          <Slider />
        </div>
        <div className='w-full h-auto flex flex-col items-start'>
          <div className='mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark'>
            下記の中から当てはまる気持ちを選んでください(各1つ選択可)
          </div>
        </div>
        <div className='w-11/12 h-auto flex flex-col items-center'>
          <div className='w-full flex flex-col items-center mt-24 border-4 rounded-xl'>
            <div className='flex justify-center mt-16 mx-24 text-lg font-semibold'>
              今の気持ちは?
            </div>
            {/* タグ */}
            <div className='w-11/12 flex flex-col justify-start'>
              <div className='flex flex-row flex-wrap'>
                {tagsNow.map((tag) => (
                  <button
                    key={tag}
                    className={`px-16 py-2 rounded-2xl mx-4 mt-12 text-md font-semibold cursor-pointer ${
                      tag1 === tag
                        ? 'bg-blue-dark text-white'
                        : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTag1Click(tag)}
                    disabled={tag1 !== null && tag1 !== tag}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className='mt-12 border-dotted font-semibold text-gray-500'>
                さらに表示
              </div>
            </div>
            <div className='mt-24 w-11/12 h-2 bg-gray-200 ' />
            <div className='flex justify-center mt-16 mx-24 text-lg font-semibold'>
              一番大きく影響しているのは?
            </div>
            <div className='w-11/12 flex flex-col justify-start pb-24'>
              <div className='flex flex-row flex-wrap'>
                {tagsInfluence.map((tag) => (
                  <button
                    key={tag}
                    className={`px-16 py-2 rounded-2xl mx-4 mt-12 text-md font-semibold cursor-pointer ${
                      tag2 === tag
                        ? 'bg-blue-dark text-white'
                        : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTag2Click(tag)}
                    disabled={tag2 !== null && tag2 !== tag}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='w-full h-auto flex flex-col items-start'>
          <div className='mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark'>
            ひとことメモ (※64文字以内)
          </div>
        </div>
        <div className='w-full flex justify-center'>
          <textarea
            maxLength={64}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className='w-11/12 border-4 rounded-lg mt-12 p-8'
            placeholder='メモを記入してください'
          />
        </div>

        <div className='w-full flex justify-center'>
          <button
            onClick={handleSave}
            className='w-1/3 h-auto my-32 py-12 rounded bg-blue-dark hover:bg-blue-200 font-semibold text-white text-2xl'
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  )
}
