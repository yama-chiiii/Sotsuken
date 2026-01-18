// app/check/page.tsx
'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import Footer from '../component/Footer'
import Live from '../component/LiveFace'
import WeatherBox from '../component/WeatherBox'
import { useAuthContext } from '../context/AuthContext'

type WeatherData = {
  description: string
  temp: number
  pressure: number
  humidity: number
  condition: string
}

function formatTemp(temp: number) {
  // 例: 12 -> 12, 12.3 -> 12.3 (小数1桁まで)
  return Number.isInteger(temp) ? `${temp}` : `${temp.toFixed(1)}`
}


export default function Check() {
  const { addDailyRecord, circleColor } = useAuthContext()
  const { setTodayWeather } = useAuthContext()

  const [todayWeather, setTodayWeatherLocal] = useState<WeatherData | null>(
    null,
  )

  // 例: 2025-10-07 形式、Asia/Tokyo 固定
  const dateKey = useCallback(
    () =>
      new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
        new Date(),
      ),
    [],
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
    [addDailyRecord, circleColor, dateKey],
  )

  // WeatherBox から受け取ったデータを
  // 1) AuthContextへ保存
  // 2) Checkページの表示用stateへ保存
  const handleWeather = useCallback(
    (data: WeatherData) => {
      setTodayWeather(data)
      setTodayWeatherLocal(data)
    },
    [setTodayWeather],
  )

  // const advice = useMemo(() => getConditionAdvice(todayWeather), [todayWeather])

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 min-h-screen items-center bg-white font-mPlus'>
        {/* セルフ診断 */}
        <div className='w-full h-auto '>
          <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
            セルフ診断
          </div>
          <div className='w-full flex justify-center'>
            <p className='w-11/12 mt-12 font-semibold text-gray-500'>
              今の自分の状態について診断します。なお、このテストの結果はあくまで参考程度であり、
              正式な診断結果ではありません。不安な方はなるべく早めに心療内科・精神科を受診してください。
            </p>
          </div>
        </div>

        <div className='w-full flex justify-center'>
          <Link href='/check/choice' className='w-full flex justify-center'>
            <button className='w-1/2 h-auto mt-32 py-24 rounded bg-pink-400 hover:bg-pink-600 font-semibold text-white text-4xl'>
              診断スタート
            </button>
          </Link>
        </div>

        {/* ロボット診断（天気などのカード） */}
        <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
          天気情報
        </div>

        <div className='w-full flex justify-center'>
          <div className='w-5/6 h-auto flex flex-col items-center border-2 border-blue-dark rounded-lg mt-24'>
            {/* ここを増やす：gridでカードを並べる */}
            <div className='w-full mb-32 px-16'>
              {/* 上：天気（WeatherBox）を中央で大きく */}
              <div className='mt-16 flex justify-center'>
                <div className='w-full'>
                  <div className='flex justify-center'>
                    <WeatherBox onWeather={handleWeather} />
                  </div>

                  {/* 下：気温/気圧/湿度（横並び） */}
                  <div className='mt-20 flex justify-center gap-16 px-20'>
                    <div className='w-1/3 rounded-2xl bg-blue-light py-24 flex flex-col items-center'>
                      <div className='text-blue-dark font-extrabold text-xl'>
                        気温
                      </div>
                      <div className='mt-12 text-blue-dark font-extrabold text-xl'>
                        {todayWeather
                          ? `${formatTemp(todayWeather.temp)}℃`
                          : '--'}
                      </div>
                    </div>

                    <div className='w-1/3 rounded-2xl bg-blue-light py-24 flex flex-col items-center'>
                      <div className='text-blue-dark font-extrabold text-xl'>
                        気圧
                      </div>
                      <div className='mt-12 text-blue-dark font-extrabold text-xl'>
                        {todayWeather ? `${todayWeather.pressure} hPa` : '--'}
                      </div>
                    </div>

                    <div className='w-1/3 rounded-2xl bg-blue-light py-24 flex flex-col items-center'>
                      <div className='text-blue-dark font-extrabold text-xl'>
                        湿度
                      </div>
                      <div className='mt-12 text-blue-dark font-extrabold text-xl'>
                        {todayWeather ? `${todayWeather.humidity}%` : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* カメラ診断：Live だけ、撮影時に保存 */}
        <div className='mt-64 mx-36'>
          <Live onShot={handleShot} />
        </div>

        <div className='w-full sticky bottom-0 z-10 flex justify-center bg-blue-100'>
          <Footer />
        </div>
      </div>
    </div>
  )
}
