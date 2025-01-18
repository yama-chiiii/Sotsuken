'use client';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // useRouter フックをインポート
import { useState } from 'react';
import { auth } from '../firebaseConfig';

export default function Setting() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // useRouter フックを初期化

  const handleRegister = async () => {
    if (!email || !password) {
      setMessage('メールアドレスとパスワードを入力してください。');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('正しいメールアドレスを入力してください。');
      return;
    }

    if (password.length < 6) {
      setMessage('パスワードは6文字以上で入力してください。');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage('新規登録成功！');
      router.push('/'); // ホームページに遷移
    } catch (error) {
      if (error instanceof Error) {
        setMessage('新規登録に失敗しました: ' + error.message);
      } else {
        setMessage('新規登録に失敗しました: 不明なエラー');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus '>
        <div className='mt-120 font-black text-4xl text-blue-dark'>
          新規登録
        </div>
        <div className='w-4/5 flex flex-col mt-24'>
          <label htmlFor='email' className='mt-40 font-semibold'>
            メールアドレス
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='border-2 rounded-md px-8 py-4'
          />
        </div>
        <div className='w-4/5 flex flex-col mt-4'>
          <label htmlFor='password' className='mt-40 font-semibold'>
            パスワード
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className='border-2 rounded-md px-8 py-4'
          />
        </div>
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-1/4 h-auto py-8 px-16 mt-36 font-semibold text-xl rounded text-center text-white ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-dark hover:bg-blue-400'
          }`}
        >
          {isLoading ? '登録中...' : '登録'}
        </button>
        {message && (
          <div className='mt-8 text-center text-red-500'>{message}</div>
        )}
      </div>
    </div>
  );
}
