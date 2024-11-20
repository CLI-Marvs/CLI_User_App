import React from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'


const FillOutDetails = () => {
  return (
    <div className='w-[1142px] py-[58px] px-[50px] rounded-[10px] bg-white'>
      <div>
        <p className='montserrat-semibold text-[20px]'>Fill Out Details</p>
        <span className='montserrat-medium text-[13px] text-custom-grayA5'>Type in the necessary information. Make sure all detials are correct.</span>
      </div>
      <div className='flex flex-col gap-[30px] mt-[50px]'>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="projectName" className='text-xs montserrat-semibold'> Project Name</label>
          <div className='relative'>
            <select name="projectName" id="projectName" className='h-[40px] w-full rounded-[6px] pl-[11px] border border-[#F4F3F3] focus:outline-none'>
              <option value="project1">Please select...</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center px-[10px] py-[6px] bg-[#F7F7F7] text-custom-gray81 pointer-events-none">
                <IoMdArrowDropdown/>
            </span>
          </div>
        </div>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="unitNumber" className='text-xs montserrat-semibold'>Unit Number</label>
          <input id='unitNumber' onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} type="number" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none'/>
        </div>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="amountDue" className='text-xs montserrat-semibold'>Amount Due</label>
          <div className='relative flex items-center'>
            <span className="absolute inset-y-0 left-[1px] rounded-l-[6px] top-[1px] flex items-center px-[8px] h-[38px] text-xs bg-[#F7F7F7] text-custom-gray81 pointer-events-none montserrat-bold">
              PHP
            </span>
            <input id='amountDue' type="number" onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[51px] no-spinner focus:outline-none'/>
          </div>
        </div>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="ownerEmail" className='text-xs montserrat-semibold'>Name of Unit Owner</label>
          <input id='ownerEmail' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none'/>
          <span className='text-sm text-custom-grayA5'>Transaction confirmation receipt will be sent to this email</span>
        </div>
        <div className=' flex flex-col  gap-[4px] '>
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
          <input id='agentName' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none'/>
        </div>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="agentEmail" className='text-xs montserrat-semibold'>Agent's Email</label>
          <input id='agentEmail' type="text" placeholder='Please input...' className='w-full h-[40px] rounded-[6px] border border-[#F4F3F3] pl-[11px] no-spinner focus:outline-none'/>
        </div>
        <div className=' flex flex-col gap-[4px] '>
          <label htmlFor="notes" className='text-xs montserrat-semibold'>Note (Optional)</label>
         <textarea name="notes" id="notes" className='border border-[#F4F3F3 h-[166px] w-full p-[11px] focus:outline-none rounded-[6px]'></textarea>
        </div>
      </div>
    </div>
  )
}

export default FillOutDetails