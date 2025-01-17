'use client'

import Slider from "../component/Slider"

export default function Syousai() {
  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>
        <div className='w-full mt-36 flex flex-col items-center'>
          <Slider/>
        </div>
        <div className='w-full h-auto flex flex-col items-start'>
          <div className='mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark'>
            下記の中から当てはまる気持ちを選んでください(〇つまで選択可)
          </div>
        </div>
        <div className='w-11/12 h-auto flex flex-col items-center'>
          <div className='w-full h-400 mt-24 border-4 rounded-xl'>
            <div className='mt-16 mx-24 text-lg font-semibold'>
              今の気持ちは?
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
        <div className='w-full flex justify-center'>
          <button className='w-1/3 h-auto my-32 py-12 rounded bg-blue-dark hover:bg-blue-200 font-semibold text-white text-2xl'>
            記録する
          </button>
        </div>
      </div>
    </div>
  )
}
