import Link from 'next/link'

export default function Choice() {
  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-blue-100'>
      <div className='w-full md:w-1/2 min-h-screen flex flex-col items-center bg-white font-mPlus'>
        <div className='text-center mt-64 mx-36 text-2xl sm:text-4xl font-semibold'>
          メンタルチェック
        </div>
        <div className='mt-24 text-center font-bold text-sm sm:text-xl'>
          診断を選んでください
        </div>
        <div className='w-3/5 mt-32 flex flex-row items-center border-2 rounded border-blue-dark'>
          <Link className='w-2/3 flex flex-col' href={'/check/choice/mental'}>
            <div className='py-32 text-center text-blue-dark font-semibold text-4xl'>
              メンタル編
            </div>
          </Link>
          <Link
            className='w-1/3 flex justify-center'
            href={'/check/choice/mental'}
          >
            <div>
              <div className='text-4xl text-center text-blue-dark hover:text-blue-300 font-semibold'>
                ＞
              </div>
            </div>
          </Link>
        </div>
        <div className='w-3/5 mt-32 flex flex-row items-center border-2 rounded border-blue-dark'>
          <Link className='w-2/3 flex flex-col' href={'/check/choice/action'}>
            <div className='py-32 text-center text-blue-dark font-semibold text-4xl'>
              行動編
            </div>
          </Link>
          <Link
            className='w-1/3 flex justify-center'
            href={'/check/choice/action'}
          >
            <div>
              <div className='text-4xl text-center text-blue-dark hover:text-blue-300 font-semibold'>
                ＞
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
