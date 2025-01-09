import Image from 'next/image'
import Footer from './component/Footer'
import './globals.css'

export default function Home() {
  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 min-h-screen bg-white font-mPlus'>
        <div className='w-full h-480'>
          <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
            今日の記録
          </div>
          <div className='flex flex-row-reverse '>
            <button className='w-80 h-32 mt-20 mx-36 sm:mx-84 rounded-md text-white bg-blue-dark'>
              記録する
            </button>
          </div>
          <div className='flex flex-col md:flex-row h-auto md:h-320 mx-32 sm:mx-84 my-16 bg-blue-verylight shadow-md rounded-md'>
            <div className='w-full md:w-1/2 h-full flex justify-center items-center'>
              <div className='w-1/6 md:w-1/2 h-100 md:h-150 mt-36 md:mt-0 bg-pink-700 rounded-full'></div>
            </div>
            <div className='w-full md:w-1/2 h-full flex flex-col '>
              <div className='flex flex-col items-center'>
                <div className='mt-20 sm:mt-40 text-md sm:text-xl font-semibold'>
                  一日の気分
                </div>
                <div className='mt-12 sm:mt-24 border-b-3 border-pink-dark text-3xl font-semibold'>
                  普通
                </div>
                <div className='flex flex-row'>
                  {/* タグ表示 */}
                  <div className='px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                    #健康
                  </div>
                  <div className='px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                    #健康
                  </div>
                </div>
              </div>
              <div className='flex flex-col md:mb-0 mb-32'>
                <div className='ml-28 mt-16 md:text-sm text-xl font-mPlus font-semibold'>
                  今日のひとことメモ
                </div>
                <div className='flex justify-center'>
                  <textarea rows={3} className='w-11/12 border rounded p-4 ' />
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
  )
}
