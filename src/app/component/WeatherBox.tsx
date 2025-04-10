'use client'

import { useEffect, useState } from 'react'

type WeatherData = {
  description: string
  temp: number
}

function getWeatherIcon(description: string) {
  if (description.includes('晴')) return '☀️'
  if (description.includes('曇')) return '☁️'
  if (description.includes('雨')) return '🌧️'
  if (description.includes('雪')) return '❄️'
  return '🌈'
}

export default function WeatherBox() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => res.json())
      .then((data) =>
        setWeather({ description: data.description, temp: data.temp }),
      )
      .catch(() => setWeather(null))
  }, [])

  return (
    <div className='text-blue-dark font-semibold flex flex-col items-center py-4'>
      <div className='text-md'>天気</div>
      {weather && (
        <>
          <div className='text-4xl'>{getWeatherIcon(weather.description)}</div>
          <div className='text-xl mt-2'>{weather.description}</div>
          <div className='text-md'>{weather.temp}℃</div>
        </>
      )}
    </div>
  )
}
