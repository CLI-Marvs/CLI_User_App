import React from 'react'
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { SurveyList } from './surveyComponents/SurveyList';


const SurveyReports = () => {

const navigate = useNavigate(); 


const navigateToSurveyForm = () => {
    navigate("/inquirymanagement/settings/surveysettings/surveyform");
};

  return (
    <div className='h-screen max-w-full bg-custom-grayFA'>
        <div className='flex flex-col gap-[30px]'>
            <div className='grid grid-cols-3 gap-[20px] w-[1058px]'>
                <div 
                    onClick={navigateToSurveyForm}  
                    className='flex justify-center items-center w-[321.21px] h-[227px] border-1 rounded-[10px] border-[#E2E2E2] hover:border-black cursor-pointer'>
                    <div className='size-[50px] gradient-btn2 rounded-full flex justify-center items-center'><IoIosAdd className='text-white size-9' /></div>
                </div>
                <SurveyList />
            </div>
        </div>
    </div>
  )
}

export default SurveyReports