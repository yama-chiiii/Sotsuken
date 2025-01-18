'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // 未ログイン時にログインページへリダイレクト
        router.push('/signin');
      } else {
        // ログイン済みの場合はローディング終了
        setLoading(false);
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // ローディング中のUI
  }

  return <>{children}</>;
}
