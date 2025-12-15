// app/api/advice.ts

export type AdviceInput = {
  mood: string          // "良好" "普通" "不調"
  activity: string[]    // タグ
  emotion: string | null
  memo: string
  weather: {
    temp: number | null
    pressure: number | null
    condition: string
  }
}

export function generateAdvice(data: AdviceInput): string {
  const lines: string[] = []

  // ◎ 気分
  if (data.mood === "不調") {
    lines.push("今日は少し気分が優れないようですね。")
  } else if (data.mood === "普通") {
    lines.push("今日は落ち着いた1日になりそうです。")
  } else if (data.mood === "良好") {
    lines.push("良い調子ですね！この調子でいきましょう。")
  }

  // ◎ 表情
  if (data.emotion === "sad") {
    lines.push("表情から少し疲れやストレスが見えるようです。無理は禁物ですよ。")
  }
  if (data.emotion === "happy") {
    lines.push("良い笑顔です！前向きな気持ちが伝わってきます。")
  }

  // ◎ 行動タグ
  if (data.activity.includes("#睡眠")) {
    lines.push("睡眠を整えることは体調管理にとても効果的です。")
  }
  if (data.activity.includes("#ストレス")) {
    lines.push("ストレスを感じやすい日かもしれません。少し休む時間も意識しましょう。")
  }

  // ◎ 天気
  if (data.weather.temp !== null) {
    if (data.weather.temp >= 28) {
      lines.push("気温が高くなっています。こまめな水分補給を忘れずに。")
    }
    if (data.weather.temp <= 10) {
      lines.push("今日は冷え込みそうです。暖かい格好で出かけましょう。")
    }
  }

  if (data.weather.pressure !== null && data.weather.pressure <= 1005) {
    lines.push("気圧が低く、体調が崩れやすい日です。無理せず過ごしてくださいね。")
  }

  // 最終合成
  if (lines.length === 0) {
    return "今日も良い1日になりますように。"
  }

  return lines.join(" ")
}
