'use client'

import Link from 'next/link'
import Slider from '../component/Slider'

export default function Syousai() {

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>
        <div className='w-full mt-36 flex flex-col items-center'>
          <Slider />
        </div>
        <div className='w-full h-auto flex flex-col items-start'>
          <div className='mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark'>
            下記の中から当てはまる気持ちを選んでください(〇つまで選択可)
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
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #健康
                </div>
                <div className='w-84 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #不健康
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #快適
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #良好
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #普通
                </div>
                <div className='w-84 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #無関心
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #不快
                </div>
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
                {' '}
                {/* flex-wrap を追加 */}
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #体調
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #睡眠
                </div>
                <div className='w-100 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #人間関係
                </div>
                <div className='w-100 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #ストレス
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #天候
                </div>
                <div className='w-72 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #趣味
                </div>
                <div className='w-84 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #タスク
                </div>
                <div className='w-84 px-16 py-4 mt-12 mx-8 font-semibold rounded-full bg-blue-light text-blue-dark text-sm'>
                  #その他
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='w-full h-auto flex flex-col items-start'>
          <div className='mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark'>
            ひとことメモ
          </div>
        </div>
        <div className='w-full flex justify-center'>
          <textarea
            rows={4}
            className='w-11/12 mt-12 border-4 p-8 rounded-lg'
          />
        </div>

        <Link href={'/'} className='w-full flex justify-center'>
          <button className='w-1/3 h-auto my-32 py-12 rounded bg-blue-dark hover:bg-blue-200 font-semibold text-white text-2xl'>
            記録する
          </button>
        </Link>
      </div>
    </div>
  )
}
