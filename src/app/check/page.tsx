'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import CameraButton from '../component/CameraButton'
import Footer from '../component/Footer'
import LiveFace from '../component/LiveFace'
import WeatherBox from '../component/WeatherBox'

export default function Check() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(true)
  const [emotionResult, setEmotionResult] = useState<string | null>(null)

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 min-h-screen items-center bg-white font-mPlus'>
        <div className='w-full h-auto '>
          <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
            セルフ診断
          </div>
          <div className='w-full flex justify-center'>
            <p className='w-11/12 mt-12 font-semibold text-gray-500'>
              今の自分の状態について診断します。
              なお、このテストの結果はあくまで参考程度であるため、
              <br />
              正式な診断結果ではありません。
              <br />
              不安な方はなるべく早めに心療内科・精神科を受診してください。
            </p>
          </div>
        </div>
        <div className='w-full flex justify-center'>
          <Link href={'/check/choice'} className='w-full flex justify-center'>
            <button className='w-1/2 h-auto mt-32 py-24 rounded bg-pink-400 hover:bg-pink-600 font-semibold text-white text-4xl'>
              診断スタート
            </button>
          </Link>
        </div>
        <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
          ロボット診断
        </div>
        <div className='w-full flex justify-center'>
          <div className='w-5/6 h-auto flex flex-col items-center border-2 border-blue-dark rounded-lg mt-24'>
            <Image
              src='/robot.svg'
              width={120}
              height={120}
              alt='robot'
              className='mt-12 w-64 h-64 md:w-120 md:h-120'
            />
            <div className='w-full h-140 mb-32 flex flex-row justify-around'>
              <div className='w-1/4 h-auto flex flex-col justify-center items-center rounded bg-blue-light'>
                <WeatherBox />
              </div>
              <div className='w-1/4 h-auto flex flex-col justify-center items-center  rounded bg-blue-light'>
                <div className='text-blue-dark font-semibold text-md'>
                  睡眠時間
                </div>
                <div className='mt-4 text-blue-dark font-semibold text-3xl'>
                  6時間
                </div>
              </div>
              <div className='w-1/4 h-auto flex flex-col justify-center items-center  rounded bg-blue-light'>
                <div className='text-blue-dark font-semibold text-lg'>体温</div>
                <div className='mt-4 text-blue-dark font-semibold text-3xl'>
                  正常
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
          カメラ診断
        </div>
        <div>
          <LiveFace
            videoRef={videoRef}
            canvasRef={canvasRef}
            isActive={isActive}
          />
          <CameraButton
            videoRef={videoRef}
            canvasRef={canvasRef}
            setIsActive={setIsActive}
            setEmotionResult={setEmotionResult}
          />
          {emotionResult && (
            <div className='w-full mt-8 flex justify-center'>
              <p className='text-blue-dark font-bold text-xl'>
                診断結果：{emotionResult}
              </p>
            </div>
          )}
        </div>
        <div className='w-full sticky bottom-0 z-10 flex justify-center bg-blue-100'>
          <Footer />
        </div>
      </div>
    </div>
  )
}
