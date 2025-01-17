'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

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
  const [sliderValue, setSliderValue] = useState(3); // スライダー初期値
  const [circleColor, setCircleColor] = useState('#F2F2F2'); // 初期色
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

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
