'use client';

import { signOut } from 'firebase/auth'; // Firebaseのログアウト関数をインポート
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // ルーターを使用
import Footer from '../component/Footer';
import { auth } from '../firebaseConfig'; // Firebase設定ファイルをインポート

export default function Setting() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebaseのサインアウト処理
      router.push('/signin'); // サインインページにリダイレクト
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 flex flex-col min-h-screen bg-white font-mPlus '>
        <div className='mt-64 mx-36 text-xl sm:text-2xl font-semibold border-b-3 border-pink-dark'>
          設定
        </div>
        <div className='flex flex-col items-center'>
          <div className='w-5/6 mt-24 flex flex-row items-center'>
            <Image
              src='/account.svg'
              width={72}
              height={72}
              alt='robot'
              className='w-40 h-40 md:w-64 md:h-64'
            />
            <div className='font-semibold ml-12 md:text-lg'>アカウント情報</div>
          </div>
          <div className='w-5/6 mt-24 flex flex-row items-center'>
            <Image
              src='/setting_heart.svg'
              width={72}
              height={72}
              alt='robot'
              className='w-40 h-40 md:w-64 md:h-64'
            />
            <div className='font-semibold ml-12 md:text-lg'>
              このアプリについて
            </div>
          </div>
          <div className='w-5/6 mt-24 flex flex-row items-center'>
            <Image
              src='/robot.svg'
              width={64}
              height={64}
              alt='robot'
              className='w-40 h-40 md:w-64 md:h-64'
            />
            <div className='font-semibold ml-12 md:text-lg'>
              ロボットについて
            </div>
          </div>
          <button
            onClick={handleLogout} // ログアウト処理を実行
            className='px-24 py-12 rounded-md font-semibold mt-36 bg-blue-dark text-white hover:bg-blue-400'
          >
            ログアウト
          </button>
        </div>
      </div>
      <div className='w-full md:w-1/2 sticky bottom-0 z-10 flex justify-center bg-blue-100'>
        <Footer />
      </div>
    </div>
  );
}
