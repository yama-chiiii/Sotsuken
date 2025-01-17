'use client'

import Link from 'next/link'
import Slider from '../component/Slider'
import { useAuthContext } from '../context/AuthContext'

export default function Syousai() {
  const { selectedTags, setSelectedTags, memo, setMemo } = useAuthContext()

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
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
                {tagsNow.map((tag) => (
                  <button
                    key={tag}
                    className={`px-16 py-2 rounded-2xl mx-4 mt-12 text-md font-semibold cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-dark text-white'
                        : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTagClick(tag)}
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
                      selectedTags.includes(tag)
                        ? 'bg-blue-dark text-white'
                        : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTagClick(tag)}
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
            ひとことメモ
          </div>
        </div>
        <div className='w-full flex justify-center'>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            className='w-11/12 border-4 rounded-lg mt-12 p-8'
            placeholder='メモを記入してください'
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
