'use client'

import moment, { Moment } from 'moment'
import 'moment/locale/ja'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import Footer from '../component/Footer'
import { useAuthContext, type DailyRecord } from '../context/AuthContext'
import ClientWrapper from '../layout.server'

moment.locale('ja')

const Calendar = () => {
  const DEFAULT_GRAY = '#d1d5db'

  const [currentMonth, setCurrentMonth] = useState(moment())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Moment | null>(null)
  const { dailyRecords } = useAuthContext()
  const router = useRouter()
  const dayKey = (m: Moment) => m.format('YYYY-MM-DD')

  const colorFromSlider = (value: number): string => {
    if (value <= 1.5) return '#bbbbbb'
    if (value <= 3) return '#9ca3af'
    return '#60a5fa'
  }

  const decideCircleColor = (rec?: DailyRecord | null): string => {
    if (!rec) return DEFAULT_GRAY
    const c = rec.circleColor?.trim().toLowerCase()
    if (c && c !== '#f2f2f2') return rec.circleColor as string
    if (typeof rec.sliderValue === 'number') return colorFromSlider(rec.sliderValue)
    return DEFAULT_GRAY
  }

  const handleMonthChange = (month: string) => {
    const selectedMonth = moment(month, 'YYYY-MM')
    setCurrentMonth(selectedMonth)
    setIsDropdownOpen(false)
  }
  const toggleDropdown = () => setIsDropdownOpen((v) => !v)
  const handleDateClick = (day: Moment) => setSelectedDate(day)

  const generateCalendar = () => {
    const startDay = currentMonth.clone().startOf('month').startOf('week')
    const endDay = currentMonth.clone().endOf('month').endOf('week')
    const day = startDay.clone().subtract(1, 'day')
    const calendar: Moment[][] = []
    while (day.isBefore(endDay, 'day')) {
      calendar.push(Array(7).fill(null).map(() => day.add(1, 'day').clone()))
    }
    return calendar
  }
  const calendar = useMemo(generateCalendar, [currentMonth])

  const generateDayClass = (day: Moment): string => {
    let classes = 'flex items-center justify-center w-10 h-10 rounded-full text-lg '
    if (day.month() !== currentMonth.month()) classes += 'text-gray-400 opacity-50 '
    else if (day.day() === 0) classes += 'text-red-500 '
    else if (day.day() === 6) classes += 'text-blue-500 '
    else classes += 'text-gray-600 '
    return classes
  }

  const months = Array(12).fill(null).map((_, i) => moment().month(i).format('YYYY-MM'))

  const selectedDateData = selectedDate ? (dailyRecords[dayKey(selectedDate)] ?? null) : null

  return (
    <ClientWrapper>
      <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
        <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>

          {/* 月選択 */}
          <div className='w-full px-4 py-4 text-center relative'>
            <div
              className='inline-flex items-center text-blue-700 text-xl font-semibold cursor-pointer mt-20'
              onClick={toggleDropdown}
            >
              {currentMonth.format('YYYY年MM月')}
              <span className='ml-2 text-lg'> ∨</span>
            </div>
            {isDropdownOpen && (
              <div className='absolute top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg z-10 w-auto px-12'>
                {months.map((month) => (
                  <div
                    key={month}
                    className='px-4 py-2 hover:bg-blue-100 cursor-pointer'
                    onClick={() => handleMonthChange(month)}
                  >
                    {moment(month, 'YYYY-MM').format('YYYY年MM月')}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* カレンダー本体 */}
          <div className='w-5/6 h-auto border-2 mt-12 rounded-t-md rounded-b-md bg-white'>
            <div className='w-full h-auto py-12 rounded-t-md justify-center grid grid-cols-7 bg-blue-dark text-white text-center text-lg font-bold'>
              {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className='pt-12 grid grid-cols-7 gap-1 '>
              {calendar.map((week, wi) => (
                <React.Fragment key={wi}>
                  {week.map((day) => {
                    const dayData = dailyRecords[dayKey(day)]
                    const circleColor = decideCircleColor(dayData as DailyRecord)
                    return (
                      <div
                        key={day.format('YYYY-MM-DD')}
                        className={`p-12 text-center cursor-pointer ${dayKey(day) === dayKey(moment()) ? 'bg-blue-300' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className='flex flex-col items-center'>
                          <div className='w-44 h-44 rounded-full mb-12' style={{ backgroundColor: circleColor }} />
                          <div className={generateDayClass(day)}>{day.date()}</div>
                        </div>
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 日付記録モーダル */}
          {selectedDate && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
              <div className='bg-white p-24 rounded-md w-3/4 max-w-md'>
                <h2 className='text-xl font-bold mb-8 border-b-2 border-pink-dark'>
                  {selectedDate.format('YYYY年MM月DD日')}の記録
                </h2>
                {selectedDateData ? (
                  <>
                    <p className='mb-2'>気分: {selectedDateData?.sliderValue ?? '—'}</p>
                    <p className='mb-2'>
                      タグ:{' '}
                      {selectedDateData?.selectedTags?.length ? selectedDateData.selectedTags.join(', ') : 'タグなし'}
                    </p>
                    <p className='mb-2'>メモ: {selectedDateData.memo ?? '—'}</p>
                    <p className='mb-2'>表情: {selectedDateData?.emotion ?? '—'}</p>
                  </>
                ) : (
                  <p className='mb-2'>記録がありません。</p>
                )}
                <button className='mt-4 px-4 py-2 bg-blue-500 text-white rounded' onClick={() => setSelectedDate(null)}>
                  閉じる
                </button>
              </div>
            </div>
          )}

          {/* 体調の記録セクション */}
          <div className='flex flex-col justify-start w-11/12 mb-24'>
            <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
              体調の記録
            </div>
            <div className='flex flex-col items-center'>

              {/* 回答記録 */}
              <div
                className='w-11/12 mt-16 flex flex-row items-center border-2 rounded-xl border-blue-dark cursor-pointer hover:bg-blue-50 transition'
                onClick={() => router.push('/calendar/history')}
              >
                <Image src='/kaitokiroku.svg' width={64} height={64} alt='robot' className='my-12 mx-12 w-40 h-40 md:w-64 md:h-64' />
                <div className='flex flex-col ml-16'>
                  <div className='font-semibold'>回答記録</div>
                  <div className='whitespace-nowrap mt-4 font-semibold text-gray-400'>過去の質問への回答内容が確認できます</div>
                </div>
                <div className='w-full flex justify-end px-24'>
                  <div className='text-3xl text-blue-dark font-semibold'>＞</div>
                </div>
              </div>

              {/* ロボットの記録 → /live へ遷移 */}
              <div
                className='w-11/12 mt-16 flex flex-row items-center border-2 rounded-xl border-blue-dark cursor-pointer hover:bg-blue-50 transition'
                onClick={() => router.push('/live')}
              >
                <Image src='/robot.svg' width={64} height={64} alt='robot' className='my-12 mx-12 w-40 h-40 md:w-64 md:h-64' />
                <div className='flex flex-col ml-16'>
                  <div className='font-semibold'>ロボットの記録</div>
                  <div className='whitespace-nowrap mt-4 font-semibold text-gray-400'>ロボットで顔診断を実施します</div>
                </div>
                <div className='w-full flex justify-end px-24'>
                  <div className='text-3xl text-blue-dark font-semibold'>＞</div>
                </div>
              </div>

            </div>
          </div>

          <div className='w-full sticky bottom-0 z-10 flex justify-center bg-blue-100'>
            <Footer />
          </div>
        </div>
      </div>
    </ClientWrapper>
  )
}

export default Calendar
