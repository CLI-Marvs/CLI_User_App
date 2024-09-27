import React, { useState } from 'react'
import Stepper from './components/Stepper'
import CLILogo from '../../../../../public/Images/CLI_Horizontal.svg'
import FillOutDetails from './contents/FillOutDetails';
import PaymentMethod from './contents/PaymentMethod';
import Review from './contents/Review';
const PaymentSection = () => {

    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
      };
    
      const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
      };


      const renderStepContent = () => {
        switch (currentStep) {
          case 0:
            return <FillOutDetails/>;
          case 1:
            return <PaymentMethod/>;
          case 2:
            return <Review/>;
          default:
            return null;
        }
      };


    return (
        <div className='w-screen px-[100px] py-[90px] bg-custom-grayFA'>
            <div className='w-full flex justify-between'>
                <img className='w-[253px] h-[84px]' src={CLILogo} alt="cli logo" />
                <Stepper currentStep={currentStep} />
            </div>
            <div className="flex mt-[60px] mb-[50px] w-auto justify-center">{renderStepContent()}</div>
            <div className="flex justify-end gap-2">
                    <button
                        onClick={handlePrev}
                        className="w-[54px] h-[54px] rounded-full disabled:opacity-50 flex justify-center items-center hover:shadow-custom4 text-white bg-custom-solidgreen"
                    >
                        prev 
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-[125px] h-[54px] rounded-[10px] text-white gradient-btn5 hover:shadow-custom4 text-sm montserrat-medium mr-[45px]"
                    >
                      proceed
                    </button>
                   
            </div>
        </div>
    )
}

export default PaymentSection