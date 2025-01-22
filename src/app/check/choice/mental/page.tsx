"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";

export default function Mental() {
  const [checkedCount, setCheckedCount] = useState(0);
  const [result, setResult] = useState("");

  const questions = [
    "寝つきが良くない",
    "ちょっとしたことでも気になる",
    "何かよくないことが起こりそうな予感がする",
    "人混みの中で気分が悪くなることがある",
    "緊張すると、手に汗をかいたり、震えたりする",
    "イライラしやすい",
    "職場で緊張することが多い",
    "じっとしていられないくらい落ち着かないときがある",
    "自分は社会から遊離しているように感じる",
    "孤独を感じるときがある",
    "憂鬱になることがある",
    "何もかもがおっくうになる",
    "わけもなく不安になることがある",
    "言いたいことがうまくいえない",
    "自分が自分でないように感じる",
    "電話のベルやドアのノックの音にびくっとすることがある",
    "夜中に目が覚める",
    "外で食事することが苦になる",
    "朝起きると気分が悪い",
    "人前にでると緊張しやすい",
  ];

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setCheckedCount(checkedCount + 1);
    } else {
      setCheckedCount(checkedCount - 1);
    }
  };

  const handleDiagnosis = () => {
    if (checkedCount <= 2) {
      setResult(
        "小さな疲れはあるものの、社会生活のうえでは影響がない程度です。現在の状態を維持するよう心がけましょう。"
      );
    } else if (checkedCount <= 6) {
      setResult(
        "現代人の疲労度としては平均的です。これ以上の疲れをためないよう、リフレッシュしながら、キープしてください。"
      );
    } else if (checkedCount <= 12) {
      setResult(
        "このままの状態で疲れをためていくと、身体的な病気を引き起こす可能性があります。生活を見直して本格的な休養を。"
      );
    } else {
      setResult(
        "そうとう心が疲れています。すでに日常生活に支障があるのでは。体調がすぐれないようなら、早めに病院で診断を。"
      );
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-blue-100">
      <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center bg-white font-mPlus">
        <div className="text-center mt-64 mx-36 text-2xl sm:text-4xl font-semibold">
          メンタルチェック
        </div>
        <div className="text-center mt-12 mx-36 text-xl sm:text-2xl font-semibold">
          メンタル編
        </div>
        <div className="mt-32 text-center font-bold text-sm sm:text-xl">
          質問にたいして 「YES」ならチェックを入れていってください。
        </div>
        <div className="w-4/5 h-auto border-2 mt-16 mb-40">
          <table className="w-full">
            <caption className="w-full bg-blue-dark py-8 text-white font-semibold text-2xl">
              メンタル編
            </caption>
            <tbody>
              {questions.map((text, index) => (
                <tr
                  key={index}
                  className={`w-full ${
                    index % 2 === 0 ? "bg-gray-200" : "bg-blue-50"
                  }`}
                >
                  <td className="py-12 text-center text-xl font-semibold">
                    {index + 1}
                  </td>
                  <td className="w-4/5 pl-36 text-md font-semibold">{text}</td>
                  <td className="w-1/12">
                    <input type="checkbox" onChange={handleCheckboxChange} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleDiagnosis}
          className="w-1/4 mb-40 py-12 px-12 text-2xl font-semibold rounded bg-pink hover:bg-pink-300 text-white"
        >
          診断する
        </button>
        {result && (
          <div className="w-3/4 p-8 bg-gray-100 border text-lg text-center mb-40">
            {result}
          </div>
        )}
        <Link href={"/"} className="w-1/4 mb-40 text-xl font-semibold rounded text-center text-pink">
          <button>ホームにもどる</button>
        </Link>
      </div>
    </div>
  );
}
