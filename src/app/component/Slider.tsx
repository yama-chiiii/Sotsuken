'use client'

type Props = {
  value: number
  onChange: (value: number) => void
}

export default function Slider({ value, onChange }: Props) {
  const calculateColor = (v: number, min: number, max: number) => {
    const ratio = (v - min) / (max - min)
    const start = [138, 159, 238]
    const mid = [242, 242, 242]
    const end = [247, 119, 166]

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
  }

  const color = calculateColor(value, 1, 5)

  return (
    <div className="slider-container w-4/5 mt-36 flex flex-col items-center">
      <div className="w-200 h-200 rounded-full" style={{ backgroundColor: color }} />
      <div className="mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark">
        今日の気分を選ぶ
      </div>

      <div className="slider-labels w-full mt-8 flex justify-between">
        <span>不調</span>
        <span>良好</span>
      </div>

      <input
        type="range"
        min="1"
        max="5"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider w-full mt-8"
        style={{ background: 'linear-gradient(to right, #8A9FEE, #F2F2F2, #F777A6)' }}
      />
    </div>
  )
}
