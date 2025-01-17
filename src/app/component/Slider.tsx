'use client';

import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

export default function Slider() {
  const { sliderValue, setSliderValue, } = useAuthContext();
  const [circleColor, setCircleColor] = useState('#F2F2F2'); // 初期色

  // スライダー位置に応じた色を計算
  const calculateColor = (value: number, min: number, max: number) => {
    const ratio = (value - min) / (max - min);
    const startColor = [138, 159, 238]; // 青 (#8A9FEE)
    const midColor = [242, 242, 242]; // グレー (#F2F2F2)
    const endColor = [247, 119, 166]; // ピンク (#F777A6)


    let r, g, b;
    // 青 → グレー (ratio <= 0.5)
    if (ratio <= 0.5) {
      const localRatio = ratio / 0.5;
      r = Math.round(startColor[0] + (midColor[0] - startColor[0]) * localRatio);
      g = Math.round(startColor[1] + (midColor[1] - startColor[1]) * localRatio);
      b = Math.round(startColor[2] + (midColor[2] - startColor[2]) * localRatio);
      // グレー → ピンク (ratio > 0.5)
    } else {
      const localRatio = (ratio - 0.5) / 0.5;
      r = Math.round(midColor[0] + (endColor[0] - midColor[0]) * localRatio);
      g = Math.round(midColor[1] + (endColor[1] - midColor[1]) * localRatio);
      b = Math.round(midColor[2] + (endColor[2] - midColor[2]) * localRatio);
    }

    //RGB色の生成
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleSliderChange = (e: { target: { value: string; }; }) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    const color = calculateColor(value, 1, 5);
    setCircleColor(color);
  };

  return (
    <div className='slider-container w-4/5 mt-36 flex flex-col items-center'>
      {/* 動的に色を変更する円 */}
      <div
        className='w-200 h-200 rounded-full'
        style={{ backgroundColor: circleColor }}
          />
          <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
          今日の気分を選ぶ
        </div>
      <div className='slider-labels w-full mt-8 flex justify-between'>
        <span>不調</span>
        <span>良好</span>
      </div>
      {/* スライダー */}
      <input
        type='range'
        min='1'
        max='5'
        step='0.01'
        value={sliderValue}
        onChange={handleSliderChange}
        className='slider w-full mt-8'
        style={{
          background: 'linear-gradient(to right, #8A9FEE, #F2F2F2, #F777A6)',
        }}
      />
    </div>
  );
}
