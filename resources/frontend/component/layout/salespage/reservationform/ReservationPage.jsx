
import React, { useState } from 'react';
import BuyersInformation from './contents/BuyersInformation';
import InitialRequirements from './contents/InitialRequirements';
import UnitSelection from './contents/UnitSelection';
import TermSheetCalculator from './contents/TermSheetCalculator';
import Confirmation from './contents/Confirmation';
import Payments from './contents/Payments';
import { GrNext, GrPrevious } from "react-icons/gr";
import Stepper from './components/Stepper';


const ReservationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);


  /* for step 2 logic */
  const [forVerification, setForVerification] = useState(true); 
  const [isDisabled, setIsDisabled] = useState(true);
  const [isProceed, setIsProceed] = useState(true);



  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BuyersInformation />;
      case 1:
        return <InitialRequirements />;
      case 2:
        return <UnitSelection />;
      case 3:
        return <TermSheetCalculator />;
      case 4:
        return <Confirmation />;
      case 5:
        return <Payments />;
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full w-full bg-white">
      <div className='w-auto p-[60px]'>
        <Stepper currentStep={currentStep} />

        <div className="flex mb-4 w-auto justify-center">{renderStepContent()}</div>

        <div className="flex justify-end gap-2">

          {/* THIS IS THE FIRST STEP THAT THE BUTTON IS PROCEED ONLY */}
          {currentStep === 0 ? (

            <button
              onClick={handleNext}
              className="w-[125px] h-[54px] rounded-[10px] text-white gradient-btn5 hover:shadow-custom4 text-sm montserrat-medium mr-[45px]"
            >
              proceed
            </button>
          ) : (
            
            <>
            {/* IN ELSE THIS PREVIOUS BUTTON IS ALWAYS ACTIVE UNTIL TO THE LAST STEP*/}
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="w-[54px] h-[54px] rounded-full disabled:opacity-50 flex justify-center items-center hover:shadow-custom4 text-white bg-custom-solidgreen"
              >
                <GrPrevious />
              </button>
              {/* HERE IS THE CURRENT STEP 2 THAT HAS OWN LOGIC WITHIN THE PAGE*/}
              {currentStep === 1 ? (
                <>
                {/* 
                
                  => IF THE USER IS FIRST TIME TO FILL UP THE FORM = THE forVerification IS TRUE AND SUBMIT FOR VERIFICATION BUTTON IS DISABLED AS DEFAULT
                  => AFTER THE USER UPLOAD ALL REQUIREMENTS, THE isDisabled IS FALSE AND NOW THE BUTTON IS ACTIVE
                  => IF THE USER CLICKED THE VERIFICATION BUTTON THE THE forVerification WILL BE SET TO FALSE AND SET TO NULL

                */}
                  {forVerification ? (
                    <button
                      disabled={isDisabled}
                      className={`w-[226px] h-[54px] rounded-[10px] text-white text-sm montserrat-medium  ${isDisabled ? 'bg-[#D1D1D1]' : 'gradient-btn5 hover:shadow-custom4'
                        }`}
                    >
                      Submit for Verification
                    </button>
                  ) : null}
                  {/* 

                    => IF THE forVerification IS FALSE THE SUBMIT FOR VERIFICATION BUTTON WILL BE HIDDEN
                    => THE NEXT BUTTON IS DISABLED AS DEFAULT
                    => AFTER ALL THE REQUIREMENTS IS VERIFIED BY THE ADMIN THE BUTTON PROCEEED IS TRUE

                  */}
                  {isProceed ? (

                    <button
                      onClick={handleNext}
                      className="w-[125px] h-[54px] rounded-[10px] text-white gradient-btn5 hover:shadow-custom4 text-sm montserrat-medium mr-[45px]"
                    >
                      proceed
                    </button>
                  ) : (
                    <button
                      disabled={true}
                      className="w-[54px] h-[54px] rounded-full disabled:opacity-50 flex justify-center items-center text-white bg-[#B9B9B9] cursor-not-allowed"
                    >
                      <GrNext />
                    </button>
                    )
                  }
                </>
                /* =========   END OF STEP 2 BUTTON LOGIC ===== */

              ) : (

                <button
                  onClick={handleNext}
                  disabled={currentStep === 6}
                  className="w-[54px] h-[54px] rounded-full disabled:opacity-50 flex justify-center items-center hover:shadow-custom4 text-white bg-custom-solidgreen"
                >
                  {currentStep === 5 ? 'Finish' : <GrNext />}
                </button>


              )

              }

            </>
          )}

        </div>
      </div>

    </div>
  );

}

export default ReservationPage