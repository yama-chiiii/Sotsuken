// app/api/advice.ts

export type AdviceInput = {
  mood: string
  activity: string[]
  emotion: string | null
  memo: string
  weather: {
    temp: number | null
    pressure: number | null
    condition: string
  }
}

type MoodLevel = "low" | "mid" | "high"
type EmotionTone = "neg" | "neu" | "pos" | "unknown"

function moodLevel(mood: string): MoodLevel {
  if (mood === "不調") return "low"
  if (mood === "良好") return "high"
  return "mid"
}

function emotionTone(emotion: string | null): EmotionTone {
  if (!emotion) return "unknown"
  const e = emotion.toLowerCase()

  if (["happy", "surprised"].includes(e)) return "pos"
  if (["sad", "angry", "disgusted", "fearful"].includes(e)) return "neg"
  if (["neutral"].includes(e)) return "neu"

  return "unknown"
}

function isBadWeather(condition: string) {
  return ["Rain", "Drizzle", "Thunderstorm", "Snow"].includes(condition)
}

export function generateAdvice(data: AdviceInput): string {
  const mood = moodLevel(data.mood)
  const tone = emotionTone(data.emotion)

  const temp = data.weather.temp
  const pressure = data.weather.pressure
  const condition = data.weather.condition

  if (mood === "low" && tone === "pos") {
    const extra =
      isBadWeather(condition) || (pressure !== null && pressure <= 1005)
        ? "天候の影響で気分が落ちているだけかもしれません。"
        : "周りには元気に見えても、心は疲れていることもあります。"

    return [
      "表情は明るいのに、気分は沈み気味のようですね。",
      "無理に元気を出そうとせず、まずは深呼吸して一度休憩してみましょう。",
      extra,
    ].join(" ")
  }

  if (mood === "high" && tone === "neg") {
    const extra =
      temp !== null && temp >= 28
        ? "暑さで体が先に疲れている可能性もあります。"
        : "体は正直なので、少し休むだけでも回復しやすいです。"

    return [
      "気分は良いのに、表情には少し疲れが見えます。",
      "集中しすぎて休憩を忘れていないか、いま一度チェックしてみてください。",
      extra,
    ].join(" ")
  }

  if (mood === "mid" && tone === "neg") {
    return [
      "気分は普通でも、表情からは少し疲れが見えます。",
      "今日は“やることを減らす日”にして、負荷を軽くしてみましょう。",
    ].join(" ")
  }

  const lines: string[] = []

  // 気分
  if (data.mood === "不調") lines.push("今日は少し気分が優れないようですね。")
  else if (data.mood === "普通") lines.push("今日は落ち着いた1日になりそうです。")
  else if (data.mood === "良好") lines.push("良い調子ですね！この調子でいきましょう。")

  // 表情
  if (tone === "neg") lines.push("表情から少し疲れやストレスが見えるようです。無理は禁物ですよ。")
  if (tone === "pos") lines.push("良い表情です！前向きな気持ちが伝わってきます。")

  // 行動タグ
  if (data.activity.includes("#睡眠")) lines.push("睡眠を整えることは体調管理にとても効果的です。")
  if (data.activity.includes("#ストレス")) lines.push("ストレスを感じやすい日かもしれません。少し休む時間も意識しましょう。")
  if (data.activity.includes("#天候")) lines.push("天気の影響は意外と大きいです。今日は無理せず、調子を整える日にしましょう。")

  // 天気
  if (isBadWeather(condition)) {
    lines.push("天候が悪い日は気分が沈みやすい傾向があります。できる範囲で気分転換してみましょう。")
  }
  if (temp !== null) {
    if (temp >= 28) lines.push("気温が高めです。水分補給と休憩をこまめに。")
    if (temp <= 10) lines.push("冷え込みそうです。体を冷やさないようにしましょう。")
  }
  if (pressure !== null && pressure <= 1005) {
    lines.push("気圧が低めで体調が崩れやすい日です。無理せず過ごしてくださいね。")
  }

  if (data.memo.trim().length >= 10) {
    lines.push("メモに書いた内容を優先して、今日は自分にやさしく過ごしましょう。")
  }

  if (lines.length === 0) return "今日も良い1日になりますように。"
  return lines.join(" ")
}
