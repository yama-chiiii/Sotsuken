'use client'

import { onAuthStateChanged } from 'firebase/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth } from './firebaseConfig'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // ★ どっちに転んでも loading は必ず解除する
      setLoading(false)

      if (!user) {
        // すでに /signin にいるなら push しない（無限遷移防止）
        if (pathname !== '/signin') router.replace('/signin')
        return
      }

      // ログイン済みならそのまま children 表示
    })

    return () => unsubscribe()
  }, [router, pathname])

  if (loading) return <div>Loading...</div>

  return <>{children}</>
}
