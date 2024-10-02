import React from 'react'
import CLI from '../../../../../public/Images/CLI20noLogo_crop.jpg'
import Logo from '../../../../../public/Images/CLI20-Logo.png'
import MasterCard from '../../../../../public/Images/mastercard.png'
import Bpi from '../../../../../public/Images/bpismall.png'
import Paynamics from '../../../../../public/Images/paynamics.png'
import { Link } from 'react-router-dom'

const PaymentMainBoard = () => {
  return (
   <div className='flex'>
        <img 
        className='relative w-[541px] h-screen  object-cover ' 
        src={CLI} 
        alt="CLIbackground" 
        />
        <img className='absolute size-[297px] left-[122px] top-[103px]' src={Logo} alt="Logo" />
        <div className='flex flex-col w-full py-[42px] px-[31px]'>
            <div className='flex justify-end space-x-2'>
                <p className='montserrat-bold'>Questions?</p><span className='montserrat-medium text-[#F1C40D] cursor-pointer'>support@paynamics.io </span>
            </div>
            <div className='flex flex-col items-start gap-[10px] mt-[127px]'>
                <p className='montserrat-bold text-[28px]'>Pay online from anywhere in the world.</p>
                <p className='montserrat-medium text-[18px] text-custom-solidgreen'>We Bank With You In Heart.</p>
            </div>
            <div className='flex mt-[33px]'>
                <Link to="/paymentmethod/payonlinenow">
                    <button className='w-[182px] h-[45px] rounded-[10px] gradient-btn5 montserrat-medium text-sm text-white'>
                        Pay Online Now
                    </button>
                </Link>
            </div>
            <div className='flex mt-[33px]'>
                <p className='font-semibold'>We Accept:</p>
            </div>
            <div className='flex gap-[12px] mt-[25px]'>
                <img  src={MasterCard} alt="sample" />
                <img  src={MasterCard} alt="sample" />
                <img  src={MasterCard} alt="sample" />
                <img  src={MasterCard} alt="sample" />
                <img  src={MasterCard} alt="sample" />
            </div>
            <div className='flex gap-[4.5px] mt-[8px]'>
                <img  src={Bpi} alt="sample" />
                <img  src={Bpi} alt="sample" />
                <img  src={Bpi} alt="sample" />
                <img  src={Bpi} alt="sample" />
            </div>
            <div className='flex flex-col mt-[33px]'>
                <p className=''>Powered By:</p>
                <img className='w-[160px] h-[50px]' src={Paynamics} alt="" />
            </div>
            <div className='flex mt-[131px] space-x-1'>
                <p>Refund Policy</p><span>|</span>
                <p>Privacy Policy</p><span>|</span>
                <p>Terms of Service</p>
            </div>
            <div className='flex flex-col mt-[33px] text-sm'>
                <p className='font-semibold'>Contact Us:</p>
                <p className='font-light'>support@paynamics.io</p>
                <p className='font-light'>US: +1 408-914-2488</p>
                <p className='font-light'>PH: (+632) 8771-2530</p>
            </div> 
        </div>
    </div>
  )
}

export default PaymentMainBoard