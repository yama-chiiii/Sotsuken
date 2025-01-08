import type { Config } from "tailwindcss";

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// spacing設定を生成
const generateSpacing = (): Record<string, string> =>
  range(1, 800).reduce((acc, i) => {
    acc[i] = `${i}px`;
    return acc;
  }, {} as Record<string, string>);

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: "#F777A6",
          dark: "#DA3170",
        },
        blue: {
          verylight:"#FAFBFF",
          light: "#CBD3F2",
          dark: "#3959CC",

        },
        green: {
          DEFAULT:"#50DF5E"
        }
      },
      spacing: {
        px: "1px",
        ...generateSpacing(),
      },
      fontFamily: {
        mPlus: ['"M PLUS Rounded 1c"', 'serif'],
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
    },
  },
  plugins: [],
} satisfies Config;
