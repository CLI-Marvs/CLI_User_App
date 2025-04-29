import React, {useState} from 'react'
import { BiSolidLeftArrow } from "react-icons/bi";
import { useNavigate, useParams } from 'react-router-dom';
import SurveyForm from './SurveyForm';
import SurveySummary from './SurveySummary';

const SurveyMain = () => {

    const navigate = useNavigate();

    const { id } = useParams();

    const [activeTab, setActiveTab] = useState('question');

    const navigateToSurveyList = () => {
        navigate(-1);
    };


    return (
        <div>
            <div className='flex gap-[24px] w-[265px] items-center justify-between mb-[20px]'>
                <div onClick={navigateToSurveyList} className='flex justify-center rounded-[10px] w-[32.96px] h-[32.96px] bg-custom-lightgreen text-white items-center cursor-pointer shrink-0 hover:shadow-custom3'>
                    <BiSolidLeftArrow className='size-[13px]' />
                </div>
                <div className='flex gap-[12px]'>
                    <button
                        onClick={() => setActiveTab('question')}
                        className={`w-[99px] h-[42px] rounded-[10px] p-[10px] flex justify-center items-center shadow-custom4 border-[0.5px] border-custom-grayA5
                ${activeTab === 'question'
                                ? 'bg-custom-lightgreen text-white  '
                                : 'border-custom-grayA5'
                            }
               `}>
                        Question
                    </button>
                    <button
                        onClick={() => setActiveTab('summary')}
                        disabled={!id}
                        className={`w-[99px] h-[42px] rounded-[10px] p-[10px] flex justify-center items-center  shadow-custom4 border-[0.5px] border-custom-grayA5
                        ${activeTab === 'summary'
                                ? 'bg-custom-lightgreen text-white'
                                : 'border-custom-grayA5'
                            }
                            ${!id ? 'opacity-50 cursor-not-allowed' : ''}
                        `}>
                        Summary
                    </button>
                </div>
            </div>
            <div>
                {activeTab === 'question' ? <SurveyForm /> : <SurveySummary />}
            </div>
        </div>
    )
}

export default SurveyMain