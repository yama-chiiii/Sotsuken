// app/check/page.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'
import Footer from '../component/Footer'
import Live from '../component/LiveFace'
import WeatherBox from '../component/WeatherBox'
import { useAuthContext } from '../context/AuthContext'


export default function Check() {
  const { addDailyRecord, circleColor } = useAuthContext()
  const { setTodayWeather } = useAuthContext()

  // 例: 2025-10-07 形式、Asia/Tokyo 固定
  const dateKey = useCallback(
    () =>
      new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
        new Date()
      ),
    []
  )

  // Liveからの撮影結果を受け取って保存
  const handleShot = useCallback(
    (emotion: string | null) => {
      if (!emotion) return
      const DEFAULT_GRAY = '#F2F2F2' // AuthContext 初期値に合わせる
      const payload =
        circleColor && circleColor !== DEFAULT_GRAY
          ? { emotion, circleColor }
          : { emotion }
      addDailyRecord(dateKey(), payload)
    },
    [addDailyRecord, circleColor, dateKey]
  )

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-blue-100">
      <div className="w-full md:w-1/2 min-h-screen items-center bg-white font-mPlus">
        {/* セルフ診断 */}
        <div className="w-full h-auto ">
          <div className="mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark">
            セルフ診断
          </div>
          <div className="w-full flex justify-center">
            <p className="w-11/12 mt-12 font-semibold text-gray-500">
              今の自分の状態について診断します。なお、このテストの結果はあくまで参考程度であり、
              正式な診断結果ではありません。不安な方はなるべく早めに心療内科・精神科を受診してください。
            </p>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <Link href="/check/choice" className="w-full flex justify-center">
            <button className="w-1/2 h-auto mt-32 py-24 rounded bg-pink-400 hover:bg-pink-600 font-semibold text-white text-4xl">
              診断スタート
            </button>
          </Link>
        </div>

        {/* ロボット診断（天気などのカード） */}
        <div className="mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark">
          ロボット診断
        </div>
        <div className="w-full flex justify-center">
          <div className="w-5/6 h-auto flex flex-col items-center border-2 border-blue-dark rounded-lg mt-24">
            <Image
              src="/robot.svg"
              width={120}
              height={120}
              alt="robot"
              className="mt-12 w-64 h-64 md:w-120 md:h-120"
            />
            <div className="w-full h-140 mb-32 flex flex-row justify-around">
              <div className="w-1/3 h-auto flex flex-col justify-center items-center rounded bg-blue-light">
                <WeatherBox onWeather={setTodayWeather} />
              </div>
              <div className="w-1/3 h-auto flex flex-col justify-center items-center rounded bg-blue-light">
                <div className="text-blue-dark font-semibold text-md">睡眠時間</div>
                <div className="mt-4 text-blue-dark font-semibold text-3xl">6時間</div>
              </div>
            </div>
          </div>
        </div>

        {/* カメラ診断：Live だけ、撮影時に保存 */}
        <div className="mt-64 mx-36">
          <Live onShot={handleShot} />
        </div>

        <div className="w-full sticky bottom-0 z-10 flex justify-center bg-blue-100">
          <Footer />
        </div>
      </div>
    </div>
  )
}
