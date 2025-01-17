'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  sliderValue: number;
  circleColor: string;
  selectedTags: string[];
  memo: string;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  setCircleColor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 状態管理
  const [sliderValue, setSliderValue] = useState(3);
  const [circleColor, setCircleColor] = useState('#F2F2F2');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  // 状態の永続化: 初期化時に`localStorage`からデータを読み込む
  useEffect(() => {
    const storedSliderValue = localStorage.getItem('sliderValue');
    const storedCircleColor = localStorage.getItem('circleColor');
    const storedSelectedTags = localStorage.getItem('selectedTags');
    const storedMemo = localStorage.getItem('memo');

    if (storedSliderValue) setSliderValue(Number(storedSliderValue));
    if (storedCircleColor) setCircleColor(storedCircleColor);
    if (storedSelectedTags) setSelectedTags(JSON.parse(storedSelectedTags));
    if (storedMemo) setMemo(storedMemo);
  }, []);

  // 状態が変わるたびに`localStorage`に保存
  useEffect(() => {
    localStorage.setItem('sliderValue', sliderValue.toString());
    localStorage.setItem('circleColor', circleColor);
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
    localStorage.setItem('memo', memo);
  }, [sliderValue, circleColor, selectedTags, memo]);

  return (
    <AuthContext.Provider
      value={{
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        setSliderValue,
        setCircleColor,
        setSelectedTags,
        setMemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
