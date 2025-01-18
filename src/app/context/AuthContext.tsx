'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  sliderValue: number;
  circleColor: string;
  selectedTags: string[];
  memo: string;
  tag1: string | null;
  tag2: string | null;
  dailyRecords: {
    [date: string]: {
      sliderValue: number;
      selectedTags: string[];
      memo: string;
      circleColor: string;
    };
  };
  setSliderValue: React.Dispatch<React.SetStateAction<number>>;
  setCircleColor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  setTag1: React.Dispatch<React.SetStateAction<string | null>>;
  setTag2: React.Dispatch<React.SetStateAction<string | null>>;
  setDailyRecords: React.Dispatch<
    React.SetStateAction<{
      [date: string]: {
        sliderValue: number;
        selectedTags: string[];
        memo: string;
        circleColor: string;
      };
    }>
  >;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sliderValue, setSliderValue] = useState(3);
  const [circleColor, setCircleColor] = useState('#F2F2F2');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dailyRecords, setDailyRecords] = useState<{
    [date: string]: {
      sliderValue: number;
      selectedTags: string[];
      memo: string;
      circleColor: string;
    };
  }>({});

  const [memo, setMemo] = useState('');
  const [tag1, setTag1] = useState<string | null>(null);
  const [tag2, setTag2] = useState<string | null>(null);

  useEffect(() => {
    const storedDailyRecords = localStorage.getItem('dailyRecords');
    const storedSliderValue = localStorage.getItem('sliderValue');
    const storedCircleColor = localStorage.getItem('circleColor');
    const storedSelectedTags = localStorage.getItem('selectedTags');
    const storedMemo = localStorage.getItem('memo');
    const storedTag1 = localStorage.getItem('tag1');
    const storedTag2 = localStorage.getItem('tag2');

    if (storedDailyRecords) setDailyRecords(JSON.parse(storedDailyRecords));
    if (storedSliderValue) setSliderValue(Number(storedSliderValue));
    if (storedCircleColor) setCircleColor(storedCircleColor);
    if (storedSelectedTags) setSelectedTags(JSON.parse(storedSelectedTags));
    if (storedMemo) setMemo(storedMemo);
    if (storedTag1) setTag1(storedTag1);
    if (storedTag2) setTag2(storedTag2);
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
    localStorage.setItem('sliderValue', sliderValue.toString());
    localStorage.setItem('circleColor', circleColor);
    localStorage.setItem('selectedTags', JSON.stringify(selectedTags));
    localStorage.setItem('memo', memo);
    localStorage.setItem('tag1', tag1 || '');
    localStorage.setItem('tag2', tag2 || '');
  }, [dailyRecords, sliderValue, circleColor, selectedTags, memo, tag1, tag2]);

  return (
    <AuthContext.Provider
      value={{
        sliderValue,
        circleColor,
        selectedTags,
        memo,
        tag1,
        tag2,
        dailyRecords,
        setSliderValue,
        setCircleColor,
        setSelectedTags,
        setMemo,
        setTag1,
        setTag2,
        setDailyRecords,
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
