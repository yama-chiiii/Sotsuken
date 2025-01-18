'use client'

import { signInWithEmailAndPassword } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { auth } from '../firebaseConfig'; // Firebase設定ファイルをインポート

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/') // ログイン成功時にトップページへ遷移
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen bg-white font-mPlus'>
        <div className='mt-120 font-black text-4xl text-blue-dark'>
          ログイン
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
            className='border-2 rounded-md px-8 py-4'
          />
        </div>
        <button
          onClick={handleSignIn}
          className='w-1/4 h-auto py-8 px-16 mt-36 font-semibold text-xl rounded text-center text-white bg-blue-dark'
        >
          ログイン
        </button>
        <div className='w-1/4 h-auto py-8 px-16 mt-4 font-semibold text-xl rounded text-center text-blue-dark'>
          <Link href={'/signup'} className='w-full'>
            <button>新規登録</button>
          </Link>
        </div>
        {error && <div className='mt-8 text-red-500'>{error}</div>}
      </div>
    </div>
  )
}
