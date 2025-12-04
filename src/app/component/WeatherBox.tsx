'use client'

import { useEffect, useState } from 'react'

type WeatherData = {
  description: string
  temp: number
  pressure: number
  humidity: number
  condition: string
}

function getWeatherIcon(description: string) {
  if (description.includes('晴')) return '☀️'
  if (description.includes('曇')) return '☁️'
  if (description.includes('雨')) return '🌧️'
  if (description.includes('雪')) return '❄️'
  return '🌈'
}

export default function WeatherBox({
  onWeather,
}: {
  onWeather?: (data: WeatherData) => void
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => res.json())
      .then((data) => {
        const weatherData: WeatherData = {
          description: data.description,
          temp: data.temp,
          pressure: data.pressure,
          humidity: data.humidity,
          condition: data.condition,
        }

        setWeather(weatherData)

        // ← AuthContext に反映させるために渡す
        if (onWeather) onWeather(weatherData)
      })
      .catch(() => setWeather(null))
  }, [onWeather])

  return (
    <div className='text-blue-dark font-semibold flex flex-col items-center py-4'>
      <div className='text-md'>天気</div>
      {weather && (
        <>
          <div className='text-4xl'>{getWeatherIcon(weather.description)}</div>
          <div className='text-xl mt-2'>{weather.description}</div>
          <div className='text-md'>{weather.temp}℃</div>
          {/* <div className='text-md mt-1'>気圧: {weather.pressure} hPa</div>
          <div className='text-md mt-1'>湿度: {weather.humidity}%</div>
          <div className='text-md mt-1'>状態: {weather.condition}</div> */}
        </>
      )}
    </div>
  )
}
