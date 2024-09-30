import React from 'react'
import CreditDebitCard from '../accordion/CreditDebitCard'
import InstallmentCredit from '../accordion/InstallmentCredit'
import InstallmentNonCredit from '../accordion/InstallmentNonCredit'
import EWallet from '../accordion/EWallet'
import OnlineBankTransfer from '../accordion/OnlineBankTransfer'
import OverTheCounter from '../accordion/OverTheCounter'
import CLILogo from '../../../../../../public/Images/CLI_Horizontal.svg'
import { IoMdArrowDropdown } from 'react-icons/io'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
const PaymentMethod = () => {
  return (
    <div className='flex w-[968px] gap-[50px]'>
      <div className='w-[463px] flex flex-col'>
        <div className='w-full '>
          <p className='montserrat-semibold text-[20px] text-custom-bluegreen leading-[15px]'>How do you like to pay?</p>
          <span className='montserrat-medium text-[13px] text-custom-grayA5 leading-[15px]'>Please select your preferred mode of payment on the list below</span>
        </div>
        <div className='w-full bg-white mt-[24px] shadow-custom5 rounded-[10px]'>
          <CreditDebitCard />
          <InstallmentCredit />
          <InstallmentNonCredit />
          <EWallet />
          <OnlineBankTransfer />
          <OverTheCounter />
        </div>
        <div className='flex items-center w-full mt-[20px] gap-[17px]'>
          <img src={CLILogo} alt="cliLogo" className='w-[166px] h-[55px]' />
          <span className='h-[30px] border-r-2 border-custom-grayA5'></span>
          <p className='montserrat-medium text-[13px] text-custom-grayA5'>Cebu Landmasters Inc. is regulated by Bangko sentral ng Pilipinas</p>
        </div>
      </div>
      <div className='w-[455px] flex flex-col bg-custom-solidgreen rounded-[10px] '>
        <div className='mx-[30px] mt-[10px] mb-[20px] h-[76px] flex flex-col justify-between'>
          <div className='flex justify-end'>
            <p className='montserrat-semibold text-xs text-custom-lightgreen'>CANCEL PAYMENT</p>
          </div>
          <div className=''>
            <p className='montserrat-medium text-xs text-white'>You are about to pay</p>
            <p className='montserrat-medium text-white flex gap-x-1'>
              <span>PHP</span>
              2,200.00
            </p>
          </div>
        </div>
        <div className='flex flex-col py-[15px] h-full w-full rounded-[10px] bg-white shadow-custom'>
          <div className='w-full flex flex-col items-center'>
            <p className='montserrat-semibold text-xs text-[#B9B9B9]'>REQUEST ID</p>
            <p className='montserrat-medium text-sm'>KSNMCPASI@SDALOWZedsJoGSADIVON</p>
          </div>
          <div className='w-full flex flex-col items-center mt-[10px] border-b border-[#f4F3F3]'>
            <div className='relative top-[1px] w-[143px] h-[40px] border border-b-[#ffffff] border-[#F4F3F3] flex justify-center items-center montserrat-medium text-xs text-custom-lightgreen'>
              PAYMENT INFO
            </div>
          </div>
          <div className='flex h-[39px] px-[30px] items-center justify-between mt-[20px]'>
            <p className='text-sm'>Item #1</p>
            <p className='text-[13] text-custom-grayA5'>PHP 1,200</p>
          </div>
          <div className='flex h-[39px] px-[30px] items-center justify-between mt-[20px]'>
            <p className='text-sm'>Item #2</p>
            <p className='text-[13] text-custom-grayA5'>PHP 800</p>
          </div>
          <div className='flex h-[39px] px-[30px] items-center justify-between mt-[20px]'>
            <p className='text-sm'>Item #3</p>
            <p className='text-[13] text-custom-grayA5'>PHP 200</p>
          </div>
          <div className='border-b w-full border-[#B9B9B9] my-[32px]'></div>
          <div className='flex px-[30px] items-center justify-between text-sm'>
            <p>Total</p>
            <p>PHP 2,000.00</p>
          </div>
          <div className='w-full flex flex-col items-center mt-[10px] border-b border-[#f4F3F3]'>
            <div className='w-[143px] h-[40px] border border-b-[#ffffff] border-[#F4F3F3] flex justify-center items-center montserrat-medium text-xs text-custom-lightgreen bg-[#F9F9F9]'>
              OTHER INFO
            </div>
          </div>
          <div className='w-full py-[25px] px-[50px] flex flex-col gap-[30px]'>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="projectName" className='text-xs montserrat-semibold'> Project Name</label>
              <div className='relative'>
                <select name="projectName" id="projectName" className='h-[40px] w-full rounded-[6px] pl-[11px] border border-[#F4F3F3] focus:outline-none'>
                  <option value="project1">Please select...</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center px-[10px] py-[6px] bg-[#F7F7F7] text-custom-gray81 pointer-events-none">
                  <IoMdArrowDropdown />
                </span>
              </div>
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="unitNumber" className='text-xs montserrat-semibold'>Unit Number</label>
              <input id='unitNumber' type="number" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none' />
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="amountDue" className='text-xs montserrat-semibold'>Amount Due</label>
              <div className='relative flex items-center'>
                <span className="absolute inset-y-0 left-[1px] rounded-l-[6px] top-[1px] flex items-center px-[8px] h-[38px] text-xs bg-[#F7F7F7] text-custom-gray81 pointer-events-none montserrat-bold">
                  PHP
                </span>
                <input id='amountDue' type="number" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[51px] no-spinner focus:outline-none' />
              </div>
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="ownerEmail" className='text-xs montserrat-semibold'>Name of Unit Owner</label>
              <input id='ownerEmail' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none' />
              <span className='text-sm text-custom-grayA5'>Transaction confirmation receipt will be sent to this email</span>
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <PhoneInput
              country={'ph'}
              enableLongNumbers={true}
              placeholder="Please input..."  
              onChange={phone => console.log(phone)}
              containerStyle={{ 
                width: "100%",
                height: "40px",
              }}
              inputStyle={{ 
                width: "100%",
                height: "40px",
                border: "1px solid #F4F3F3",
              }}
              buttonStyle={{
                  border: "1px solid #F4F3F3",
                  backgroundColor: "#F7F7F7"
              }}
              />
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="agentName" className='text-xs montserrat-semibold'>Agent's Full Name</label>
              <input id='agentName' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none' />
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="agentEmail" className='text-xs montserrat-semibold'>Agent's Email</label>
              <input id='agentEmail' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none' />
            </div>
            <div className=' flex flex-col gap-[4px] '>
              <label htmlFor="notes" className='text-xs montserrat-semibold'>Note (Optional)</label>
              <textarea name="notes" id="notes" className='border border-[#F4F3F3 h-[166px] w-full p-[11px] focus:outline-none rounded-[6px]'></textarea>
            </div>
          </div>
          <div className='w-full flex justify-center mb-[20px]'>
            <button
              className="w-[233px] h-[45px] rounded-[10px] gradient-btn2 p-[1px] mt-[20px]"
            >
              <div className='h-full w-full bg-white rounded-[9px] flex justify-center items-center text-sm montserrat-semibold text-custom-solidgreen hover:shadow-custom4'>
                <p className='bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent'>
                  Change Details
                </p> 
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethod