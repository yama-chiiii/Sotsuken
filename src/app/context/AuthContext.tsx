'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  sliderValue: number;
  circleColor: string;
  selectedTags: string[];
  memo: string;
  tag1: string | null;
  tag2: string | null;
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  setCircleColor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  setTag1: React.Dispatch<React.SetStateAction<string | null>>;
  setTag2: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 状態管理
  const [sliderValue, setSliderValue] = useState(3);
  const [circleColor, setCircleColor] = useState('#F2F2F2');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [tag1, setTag1] = useState<string | null>(null);
  const [tag2, setTag2] = useState<string | null>(null);


  // 状態の永続化: 初期化時に`localStorage`からデータを読み込む
  useEffect(() => {
    const storedSliderValue = localStorage.getItem('sliderValue');
    const storedCircleColor = localStorage.getItem('circleColor');
    const storedSelectedTags = localStorage.getItem('selectedTags');
    const storedMemo = localStorage.getItem('memo');
    const storedTag1 = localStorage.getItem('tag1');
    const storedTag2 = localStorage.getItem('tag2');

    if (storedSliderValue) setSliderValue(Number(storedSliderValue));
    if (storedCircleColor) setCircleColor(storedCircleColor);
    if (storedSelectedTags) setSelectedTags(JSON.parse(storedSelectedTags));
    if (storedMemo) setMemo(storedMemo);
    if (storedTag1) setTag1(storedTag1);
    if (storedTag2) setTag2(storedTag2);
  }, []);

  // 状態が変わるたびに`localStorage`に保存
  useEffect(() => {
    localStorage.setItem('sliderValue', sliderValue.toString());
    localStorage.setItem('circleColor', circleColor);
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
    localStorage.setItem('memo', memo);
    localStorage.setItem('tag1', tag1 || '');
    localStorage.setItem('tag2', tag2 || '');
  }, [sliderValue, circleColor, selectedTags, memo,tag1,tag2]);

  return (
    <AuthContext.Provider
      value={{
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        tag1,
        tag2,
        setSliderValue,
        setCircleColor,
        setSelectedTags,
        setMemo,
        setTag1,
        setTag2,
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
