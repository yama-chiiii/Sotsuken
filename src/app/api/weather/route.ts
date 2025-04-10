// src/app/api/weather/route.ts
import { NextResponse } from 'next/server'

const API_KEY = process.env.OPENWEATHER_API_KEY

export async function GET() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Fukuoka,jp&appid=${API_KEY}&units=metric&lang=ja`

  try {
    const response = await fetch(url)
    const data = await response.json()

    const weather = {
      description: data.weather?.[0]?.description || '',
      temp: data.main?.temp || '',
    }

    return NextResponse.json(weather)
  } catch {
    return NextResponse.json({ error: '天気情報の取得に失敗しました' }, { status: 500 })
  }
}
