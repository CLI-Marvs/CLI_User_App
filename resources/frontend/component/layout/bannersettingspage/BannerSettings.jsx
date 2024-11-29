import React from 'react'
import ImageSlideshow from './ImageSlideshow'
import Ads1 from '../../../../../public/Images/AskCLI_Ad1.jpg'
import Ads2 from '../../../../../public/Images/AskCLI_Ad2.jpg'
import Ads3 from '../../../../../public/Images/AskCLI_Ad3.jpg'
const BannerSettings = () => {

    const images = [
        { src: Ads1, link: "https://cebulandmasters.com/" },
        { src: Ads2, link: "https://www.facebook.com/theofficialNorthGroveatPristinaTown" },
    ];


  return (
    <div className='h-screen max-w-full bg-custom-grayFA p-[20px]'>
        <div className='flex mb-[12px]'>
            <p className='montserrat-semibold text-[20px]'>Live Preview</p>
        </div>
        <div className='flex flex-col gap-[20px] max-w-[583px]'>
            <div className='w-full'>
                <ImageSlideshow images={images} />
            </div>
            <div className='w-full border-t-[1px] border-custom-grayA5'></div>
            <div className='flex flex-col gap-[12px] w-full'>
                <p className='montserrat-medium'>Settings</p>
                <div className='w-full h-[112px] rounded-[10px] bg-custom-lightestgreen p-[20px]'>
                    <div className=' flex flex-col w-full h-full bg-white rounded-[10px] justify-center'>
                        <div className='flex h-[31px] px-[16px] items-center gap-[11px] text-sm'>
                            <p className='montserrat-medium '>Image:</p>
                            <div className='w-[345px] montserrat-light'>
                                sdf
                            </div>
                            <div className='flex gap-[19px] text-sm'>
                                <button className='montserrat-medium bg-gradient-to-r from-custom-bluegreen to-custom-solidgreen bg-clip-text text-transparent'>Edit</button>
                                <button className='montserrat-medium text-[#EB4444]'>Delete</button>
                            </div>
                        </div>
                        <div className='flex h-[31px] px-[16px] items-center gap-[25px] text-sm'>
                            <p className='montserrat-medium'>Link:</p>
                            <p className='w-full'>https://photo-images.ads/cli/g-derive.com/aftyea-821ioias.1298nkz</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-full border-t-[1px] border-custom-grayA5'></div>
            <div className='flex flex-col gap-[10px] w-full bg-[#EBEBEB] p-[20px] rounded-[10px]'>
                <div className='flex w-full rounded-[10px] relative bg-white overflow-hidden'>
                    <div className='flex w-[108px] justify-start items-center px-[15px] py-[6px] text-white bg-[#273B4A] rounded-l-[10px]'>
                        Image
                    </div>
                    <div className="flex w-[335px] justify-start items-center px-[15px] py-[6px] bg-white overflow-hidden">
                        <p className="truncate whitespace-nowrap overflow-hidden text-ellipsis">
                            sdfsssssssssssssssssssssssssdfwefwfewefwefwefwf
                        </p>
                    </div>
                    <div className='absolute right-4 top-2'>
                        <button className='w-[74px] h-[22px] flex justify-center items-center text-white bg-custom-lightgreen py-[6px] montserrat-medium text-xs rounded-[5px]'>Upload</button>
                    </div>
                </div>
                <div className='flex w-full rounded-[10px] relative bg-white overflow-hidden'>
                    <div className='flex w-[108px] justify-start items-center px-[15px] py-[6px] text-white bg-[#273B4A] shrink-0 rounded-l-[10px]'>
                        Link
                    </div>
                   <input type="text" className='w-full px-[15px] outline-none' />
                </div>
                <div className='w-full flex justify-center items-center text-sm'>
                    <button className='flex justify-center items-center gradient-btn2 w-[104px] h-[31px] text-white rounded-[5px] py-[10px]'>
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default BannerSettings