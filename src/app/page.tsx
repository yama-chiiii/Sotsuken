'use client'

import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import Footer from './component/Footer'
import { useAuthContext } from './context/AuthContext'
import './globals.css'
import ClientWrapper from './layout.server'

export default function Home() {
  const { circleColor } = useAuthContext()
  const { dailyRecords } = useAuthContext()
  const today = moment().format('YYYY-MM-DD')

  const { selectedTags, memo } = useAuthContext()

  const getMoodText = (value: number) => {
    if (value <= 1.5) return '不調'
    if (value <= 3) return '普通'
    return '良好'
  }

  const todayData = dailyRecords[today] || {
    sliderValue: 3,
    selectedTags: [],
    memo: '',
  }

  return (
    <ClientWrapper>
      <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
        <div className='w-full md:w-1/2 min-h-screen bg-white font-mPlus'>
          <div className='w-full h-480'>
            <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
              今日の記録
            </div>
            <div className='flex flex-row-reverse '>
              <Link href={'/syousai'}>
                <button className='w-80 h-32 mt-20 mx-36 sm:mx-84 font-semibold rounded-md text-white bg-blue-dark'>
                  記録する
                </button>
              </Link>
            </div>
            <div className='flex flex-col md:flex-row h-auto md:h-320 mx-32 sm:mx-84 my-16 bg-blue-verylight shadow-md rounded-md'>
              <div className='w-full md:w-1/2 h-full flex justify-center items-center'>
                <div
                  className='w-160 h-160 mt-12 mx-auto rounded-full'
                  style={{ backgroundColor: circleColor }}
                ></div>
              </div>
              <div className='w-full md:w-1/2 h-full flex flex-col '>
                <div className='flex flex-col items-center'>
                  <div className='mt-20 sm:mt-40 text-md sm:text-xl font-semibold'>
                    一日の気分
                  </div>
                  <div className='text-3xl font-semibold mt-8'>
                    {getMoodText(todayData.sliderValue)}
                  </div>
                  <div className='flex flex-row'>
                    {/* タグ表示 */}
                    {selectedTags.map((tag, index) => (
                      <div
                        key={index}
                        className='px-16 py-4 bg-blue-light rounded-full text-blue-dark mx-4 mt-12 text-md font-semibold '
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex flex-col md:mb-0 mb-32'>
                  <div className='ml-28 mt-16 md:text-sm text-xl font-mPlus font-semibold'>
                    今日のひとことメモ
                  </div>
                  <div className='w-full flex justify-center flex-wrap'>
                    <div className='w-11/12 border-3 rounded-md font-semibold mt-4 bg-white px-4 py-12'>
                      {memo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className='flex flex-col mt-64 md:mt-0'>
              <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
                ロボットからの記録
              </div>
              <div className='flex flex-col items-center mt-12'>
                <Image
                  src='/robot.svg'
                  width={120}
                  height={64}
                  alt='robot'
                  className='mt-12'
                />
                <div className='mt-4 font-semibold text-2xl'>
                  本日の体調：
                  <span className='text-green'>異常なし</span>
                </div>
                <div className='w-4/5 flex flex-col justify-start border-3 mb-12 border-gray-300 rounded-md mt-24'>
                  <div className='mt-32 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
                    ひとことアドバイス
                  </div>
                  <div className='px-40 mt-20 mb-20 '>
                    <div className='font-semibold'>
                      昨日は部屋の電気がついている時間が長かったですね？
                      <br />
                      作業も大事ですが、睡眠は十分にとるようにしましょう！
                      <br />
                      (照度センサの値で測定)
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-11/12 flex flex-row-reverse mb-32 font-semibold text-blue-dark'>
                詳しく見る＞
              </div>
            </div>
            {/* sticky: スクロールとともに位置が変わらない。bottom-0がいるよ！ */}
            <div className='w-full sticky bottom-0 z-10 flex justify-center bg-blue-100'>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  )
}
