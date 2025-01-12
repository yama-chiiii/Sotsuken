import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <div className='w-full flex flex-row justify-around h-auto border-t-3 border-gray-200 bg-white'>
      <div className='flex flex-col justify-center items-center'>
        <Link href={'/'}>
          <Image
            src='/home_blue.svg'
            width={64}
            height={64}
            alt='robot'
            className='mt-12 w-40 h-40 md:w-64 md:h-64'
          />

          <p className='font-semibold text-blue-dark'>ホーム</p>
        </Link>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <Image
          src='/kiroku_gray.svg'
          width={64}
          height={64}
          alt='robot'
          className='mt-12 w-40 h-40 md:w-64 md:h-64'
        />
        <p className='font-semibold text-gray-500'>記録</p>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <Image
          src='/sindan_gray.svg'
          width={64}
          height={64}
          alt='robot'
          className='mt-12 w-40 h-40 md:w-64 md:h-64'
        />
        <p className='font-semibold text-gray-500'>診断</p>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <Link href={'/setting'}>
          <Image
            src='/settei_gray.svg'
            width={64}
            height={64}
            alt='robot'
            className='mt-12 w-40 h-40 md:w-64 md:h-64'
          />
          <p className='font-semibold text-gray-500'>設定</p>
        </Link>
      </div>
    </div>
  )
}
