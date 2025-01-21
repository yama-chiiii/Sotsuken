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
        <div className='w-11/12 mt-16 flex flex-row items-center border-2 rounded border-blue-dark'>
          <div className='flex flex-col ml-16'>
            <div className=""></div>
          </div>
          <div className='w-full flex justify-end px-24'>
            <div className='text-3xl text-blue-dark font-semibold'>＞</div>
          </div>
        </div>
      </div>
    </div>
  )
}
