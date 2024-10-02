import React,{useState} from 'react'
import { FaCheck } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
const steps = ['Fill out details', 'Payment Method', 'Review'];

const Stepper = ({currentStep}) => {
    return (
        <div className="flex items-start justify-center pl-[60px] mb-8 ">
          {steps.map((step, index) => (
            <>
                <div key={index} className="flex flex-col items-start">
                {/* Circle */}
                <div className="flex items-center">
                    <div
                    className={`flex items-center justify-center w-[37px] h-[37px] border-[3px] rounded-full text-center montserrat-medium text-sm ${
                        currentStep > index
                        ? 'border-custom-lightgreen bg-custom-lightgreen text-white'
                        : currentStep === index
                        ? 'border-custom-lightgreen text-custom-lightgreen'
                        : 'border-[#D9D9D9]'
                    }`}
                    >
                    {currentStep > index ? null : currentStep == index ? null : 0}{currentStep > index ?  <FaCheck /> : currentStep == index ?  <GoDotFill className='size-[26px]'/> : index + 1 }
                    </div>
        
                    {/* Line between circles (except for the last one) */}
                    {index !== steps.length - 1 && (
                    <div
                        className={`h-[3px] w-[93px] ${
                        currentStep > index ? 'bg-custom-lightgreen' : 'bg-[#D9D9D9]'
                        }`}
                    />
                    )}
                    </div>
        
                {/* Label under the circle */}
                    <span className={`relative mt-[11px] right-[15px] text-[15px]  text-center w-[69px] leading-6 ${
                        currentStep > index
                        ? 'border-custom-lightgreen text-custom-lightgreen montserrat-bold'
                        : currentStep === index
                        ? 'border-custom-lightgreen text-custom-lightgreen montserrat-bold'
                        : 'border-gray-400 text-[#465668] montserrat-regular'
                    }`}>
                        {step}
                    </span>
                </div>
               
            </>
           
          ))}
        </div>
      );
}

export default Stepper