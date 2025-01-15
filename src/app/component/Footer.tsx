'use client'

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentPath = usePathname();

  //コードの重複を減らす
  const menuItems = [
    { id: 'home', label: 'ホーム', href: '/', iconActive: '/home_blue.svg', iconInactive: '/home_gray.svg' },
    { id: 'calendar', label: '記録', href: '/calendar', iconActive: '/kiroku_blue.svg', iconInactive: '/kiroku_gray.svg' },
    { id: 'check', label: '診断', href: '/check', iconActive: '/sindan_blue.svg', iconInactive: '/sindan_gray.svg' },
    { id: 'setting', label: '設定', href: '/setting',iconActive: '/settei_blue.svg',  iconInactive: '/settei_gray.svg' },
  ]

  return (
    <div className='w-full flex flex-row justify-around h-auto border-t-3 border-gray-200 bg-white'>
      {menuItems.map(({ id, label, href, iconActive, iconInactive }) => (
        <div key={id} className="flex flex-col justify-center items-center">
          <Link href={href} aria-label={label}>
            <Image
              src={currentPath === href ? iconActive || iconInactive : iconInactive}
              width={64}
              height={64}
              alt={label}
              className="mt-12 w-40 h-40 md:w-64 md:h-64"
            />
            <p
              className={`text-center font-semibold ${
                currentPath === href ? 'text-blue-dark' : 'text-gray-500'
              }`}
            >
              {label}
            </p>
            </Link>
        </div>
      ))}

    </div>
  )
}
