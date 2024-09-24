import React,{useState} from 'react'
import { FaCheck } from "react-icons/fa";

const steps = ['Buyer Registration', 'Account Verification', 'Unit Selection', 'Term Sheet Calculator', 'Confirmation', 'Payment'];

const Stepper = ({currentStep}) => {
    return (
        <div className="flex items-start justify-center pl-[60px] mb-8 pt-[30px]">
          {steps.map((step, index) => (
            <>
                <div key={index} className="flex flex-col items-start">
                {/* Circle */}
                <div className="flex items-center">
                    <div
                    className={`flex items-center justify-center w-[50px] h-[50px] border-[3px] rounded-full text-center montserrat-medium text-[20px] ${
                        currentStep > index
                        ? 'border-custom-lightgreen bg-custom-lightgreen text-white'
                        : currentStep === index
                        ? 'border-custom-lightgreen text-custom-lightgreen'
                        : 'border-[#D9D9D9]'
                    }`}
                    >
                    {currentStep > index ? '' : "0"}{currentStep > index ? <FaCheck /> : index + 1}
                    </div>
        
                    {/* Line between circles (except for the last one) */}
                    {index !== steps.length - 1 && (
                    <div
                        className={`h-[3px] w-[124px] ${
                        currentStep > index ? 'bg-custom-lightgreen' : 'bg-[#D9D9D9]'
                        }`}
                    />
                    )}
                    </div>
        
                {/* Label under the circle */}
                    <span className={`relative mt-[16px] right-[35px] text-[20px]  text-center w-[120px] leading-6 ${
                        currentStep > index
                        ? 'border-custom-lightgreen text-custom-lightgreen montserrat-bold'
                        : currentStep === index
                        ? 'border-custom-lightgreen text-custom-lightgreen montserrat-bold'
                        : 'border-gray-400 text-gray-400 montserrat-regular'
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