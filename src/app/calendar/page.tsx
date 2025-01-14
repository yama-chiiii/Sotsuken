'use client'

import moment, { Moment } from 'moment'
import 'moment/locale/ja'
import Image from 'next/image'
import React, { useState } from 'react'

moment.locale('ja')

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(moment())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleMonthChange = (month: string) => {
    const selectedMonth = moment(month, 'YYYY-MM')
    setCurrentMonth(selectedMonth)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const generateCalendar = () => {
    const startDay = currentMonth.clone().startOf('month').startOf('week')
    const endDay = currentMonth.clone().endOf('month').endOf('week')
    const day = startDay.clone().subtract(1, 'day')
    const calendar = []

    while (day.isBefore(endDay, 'day')) {
      calendar.push(
        Array(7)
          .fill(null)
          .map(() => day.add(1, 'day').clone()),
      )
    }

    return calendar
  }

  const calendar = generateCalendar()

  const generateDayClass = (day: Moment): string => {
    let classes =
      'flex items-center justify-center w-10 h-10 rounded-full text-lg '
    if (day.month() !== currentMonth.month()) {
      classes += 'text-gray-400 opacity-50 ' // 他の月は薄く表示
    } else if (day.day() === 0) {
      classes += 'text-red-500 ' // 日曜日は赤
    } else if (day.day() === 6) {
      classes += 'text-blue-500 ' // 土曜日は青
    } else {
      classes += 'text-gray-600 ' // 平日は灰色
    }
    return classes
  }

  const months = Array(12)
    .fill(null)
    .map((_, index) => moment().month(index).format('YYYY-MM'))

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>
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
        <div className='w-5/6 h-auto border-2  mt-12 rounded-t-md rounded-b-md bg-white'>
          <div className='w-full h-auto py-12 rounded-t-md justify-center grid grid-cols-7 bg-blue-dark text-white text-center text-lg font-bold'>
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div key={index}>{day}</div>
            ))}
          </div>
          <div className='pt-12 grid grid-cols-7 gap-1 '>
            {calendar.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day) => (
                  <div
                    key={day.format('YYYY-MM-DD')}
                    className='p-12 text-center'
                  >
                    <div className='flex flex-col items-center pb-4'>
                      <div className='w-44 h-44 bg-gray-300 rounded-full mb-12'></div>
                      <div className={`${generateDayClass(day)}`}>
                        {day.date()}
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className='flex flex-col justify-start w-11/12'>
          <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
            体調の記録
          </div>
          <div className='flex flex-col items-center'>
            <div className='w-11/12 mt-16 flex flex-row items-center border-2 rounded-xl border-blue-dark'>
              <Image
                src='/kaitokiroku.svg'
                width={64}
                height={64}
                alt='robot'
                className='my-12 mx-12 w-40 h-40 md:w-64 md:h-64'
              />
              <div className='flex flex-col ml-16'>
                <div className='font-semibold'>回答記録</div>
                <div className='mt-4 font-semibold text-gray-400'>
                  過去の質問への回答内容が確認できます
                </div>
              </div>
              <div className='ml-180 text-3xl text-blue-dark font-semibold'>＞</div>
            </div>
            <div className='w-11/12 mt-16 flex flex-row items-center border-2 rounded-xl border-blue-dark'>
              <Image
                src='/hospital.svg'
                width={64}
                height={64}
                alt='robot'
                className='my-12 mx-12 w-40 h-40 md:w-64 md:h-64'
              />
              <div className='flex flex-col ml-16'>
                <div className='font-semibold'>病気の記録</div>
                <div className='mt-4 font-semibold text-gray-400'>
                  過去に診断された病気の情報を記録できます
                </div>
              </div>
              <div className='ml-148 text-3xl text-blue-dark font-semibold'>＞</div>
            </div>
            <div className='w-11/12 mt-16 flex flex-row items-center border-2 rounded-xl border-blue-dark'>
              <Image
                src='/robot.svg'
                width={64}
                height={64}
                alt='robot'
                className='my-12 mx-12 w-40 h-40 md:w-64 md:h-64'
              />
              <div className='flex flex-col ml-16'>
                <div className='font-semibold'>ロボットの記録</div>
                <div className='mt-4 font-semibold text-gray-400'>
                  過去のロボットからの診断結果を確認できます
                </div>
              </div>
              <div className='ml-132 text-3xl text-blue-dark font-semibold'>＞</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
