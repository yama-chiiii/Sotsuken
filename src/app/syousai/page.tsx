'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Slider from '../component/Slider'
import { useAuthContext, type DailyRecord } from '../context/AuthContext'

export default function Syousai() {
  const router = useRouter()

  const DEFAULT_SYOUSAI_GRAY = '#F2F2F2'

  const { todayKey, dailyRecords, addDailyRecord } = useAuthContext()

  // ✅ defaults は「必須型」で固定（毎レンダーで参照が変わらないように useMemo）
  const defaults = useMemo(
    () => ({
      sliderValue: 3,
      selectedTags: [] as string[],
      memo: '',
    }),
    [],
  )

  // ✅ その日の raw record（参照揺れの影響を局所化する）
  const rawToday: Partial<DailyRecord> = useMemo(() => {
    const recs = (dailyRecords ?? {}) as Record<string, Partial<DailyRecord>>
    return recs[todayKey] ?? {}
  }, [dailyRecords, todayKey])

  // ✅ フォーム状態は「ローカル state」で管理（Contextに直結しない）
  const [sliderValue, setSliderValue] = useState<number>(defaults.sliderValue)
  const [selectedTags, setSelectedTags] = useState<string[]>(defaults.selectedTags)
  const [memo, setMemo] = useState<string>(defaults.memo)

  // tag は「選択状態の見た目制御」のためだけにローカルで持つ
  const [tag1, setTag1] = useState<string | null>(null)
  const [tag2, setTag2] = useState<string | null>(null)

  // ✅ todayKey が変わったときだけ、その日の値をフォームに流し込む
  //    dailyRecords を依存に入れると「Firestore反映の度に入力中フォームが上書きされる」ので注意。
  useEffect(() => {
    const nextSlider = rawToday.sliderValue ?? defaults.sliderValue
    const nextTags = rawToday.selectedTags ?? defaults.selectedTags
    const nextMemo = rawToday.memo ?? defaults.memo

    setSliderValue(nextSlider)
    setSelectedTags(nextTags)
    setMemo(nextMemo)

    // tag1/tag2 は selectedTags に同期（最大2つ）
    setTag1(nextTags[0] ?? null)
    setTag2(nextTags[1] ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey])

  // ✅ circleColor は sliderValue から派生（stateで持たない）
  const circleColor = useMemo(() => {
    const min = 1
    const max = 5
    const ratio = (sliderValue - min) / (max - min)

    const start = [138, 159, 238] // #8A9FEE
    const mid = [242, 242, 242]   // #F2F2F2
    const end = [247, 119, 166]   // #F777A6

    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

    let r: number, g: number, b: number
    if (ratio <= 0.5) {
      const t = ratio / 0.5
      r = lerp(start[0], mid[0], t)
      g = lerp(start[1], mid[1], t)
      b = lerp(start[2], mid[2], t)
    } else {
      const t = (ratio - 0.5) / 0.5
      r = lerp(mid[0], end[0], t)
      g = lerp(mid[1], end[1], t)
      b = lerp(mid[2], end[2], t)
    }
    return `rgb(${r}, ${g}, ${b})`
  }, [sliderValue])

  // ---- tag handlers（「各1つ選択可」を維持しつつ、保存は selectedTags に集約）----

  const upsertTag = (prev: string[], tag: string) =>
    prev.includes(tag) ? prev : [...prev, tag]

  const removeTag = (prev: string[], tag: string) => prev.filter((t) => t !== tag)

  const handleTag1Click = (tag: string) => {
    if (tag1 === tag) {
      setTag1(null)
      setSelectedTags((prev) => removeTag(prev, tag))
      return
    }

    // tag1 は「単選択」なので、前の tag1 を selectedTags から外してから追加
    setSelectedTags((prev) => {
      let next = prev
      if (tag1) next = removeTag(next, tag1)
      next = upsertTag(next, tag)
      return next
    })
    setTag1(tag)
  }

  const handleTag2Click = (tag: string) => {
    if (tag2 === tag) {
      setTag2(null)
      setSelectedTags((prev) => removeTag(prev, tag))
      return
    }

    setSelectedTags((prev) => {
      let next = prev
      if (tag2) next = removeTag(next, tag2)
      next = upsertTag(next, tag)
      return next
    })
    setTag2(tag)
  }

  // ---- save ----

  const handleSave = async () => {
    const patch: Partial<DailyRecord> = {
      sliderValue,
      selectedTags,
      memo,
    }

    // ✅ デフォルトグレーは未設定扱い（保存しない）
    if (circleColor && circleColor.toLowerCase() !== DEFAULT_SYOUSAI_GRAY.toLowerCase()) {
      patch.circleColor = circleColor
    }

    await addDailyRecord(todayKey, patch)

    alert('保存しました！')
    router.push('/')
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
    // ✅ 日付跨ぎは todayKey でリマウントして見た目も状態も確実に切り替える
    <div
      key={todayKey}
      className="w-full min-h-screen flex flex-col items-center bg-blue-100"
    >
      <div className="w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus">
        <div className="w-full mt-36 flex flex-col items-center">
          {/* ✅ Slider は props で制御（Context直結しない） */}
          <Slider value={sliderValue} onChange={setSliderValue} />


        </div>

        <div className="w-full h-auto flex flex-col items-start">
          <div className="mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark">
            下記の中から当てはまる気持ちを選んでください(各1つ選択可)
          </div>
        </div>

        <div className="w-11/12 h-auto flex flex-col items-center">
          <div className="w-full flex flex-col items-center mt-24 border-4 rounded-xl">
            <div className="flex justify-center mt-16 mx-24 text-lg font-semibold">
              今の気持ちは?
            </div>

            <div className="w-11/12 flex flex-col justify-start">
              <div className="flex flex-row flex-wrap">
                {tagsNow.map((tag) => (
                  <button
                    key={tag}
                    className={`px-16 py-2 rounded-2xl mx-4 mt-12 text-md font-semibold cursor-pointer ${
                      tag1 === tag ? 'bg-blue-dark text-white' : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTag1Click(tag)}
                    // disabled={tag1 !== null && tag1 !== tag}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-24 w-11/12 h-2 bg-gray-200 " />

            <div className="flex justify-center mt-16 mx-24 text-lg font-semibold">
              一番大きく影響しているのは?
            </div>

            <div className="w-11/12 flex flex-col justify-start pb-24">
              <div className="flex flex-row flex-wrap">
                {tagsInfluence.map((tag) => (
                  <button
                    key={tag}
                    className={`px-16 py-2 rounded-2xl mx-4 mt-12 text-md font-semibold cursor-pointer ${
                      tag2 === tag ? 'bg-blue-dark text-white' : 'bg-blue-light text-blue-dark'
                    }`}
                    onClick={() => handleTag2Click(tag)}
                    // disabled={tag2 !== null && tag2 !== tag}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-auto flex flex-col items-start">
          <div className="mt-64 mx-36 text-xl sm:text-lg font-semibold border-b-3 border-pink-dark">
            ひとことメモ (※64文字以内)
          </div>
        </div>

        <div className="w-full flex justify-center">
          <textarea
            maxLength={64}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
            className="w-11/12 border-4 rounded-lg mt-12 p-8"
            placeholder="メモを記入してください"
          />
        </div>

        <div className="w-full flex justify-center">
          <button
            onClick={handleSave}
            className="w-1/3 h-auto my-32 py-12 rounded bg-blue-dark hover:bg-blue-200 font-semibold text-white text-2xl"
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  )
}
