import React, { useEffect, useState } from 'react'
import SummaryBar from './surveyComponents/SummaryBar';

import { useParams } from 'react-router-dom';
import apiService from '../../servicesApi/apiService';
const SurveySummary = () => {

    const { id } = useParams();
    const [surveyId, setSurveyId] = useState(id || null);
    const [surveySummary, setSurveySummary] = useState([]);
    
    useEffect(() => {
        if (!surveyId) return;
    
        apiService
          .get(`/survey-summary/${surveyId}`)
          .then((response) => {
            setSurveySummary(response.data);
            
          })
          .catch((error) => {
            console.error('Error fetching survey summary:', error);
            setSurveySummary([]); // fallback if needed
           
          });
      }, [surveyId]);

    return (
        <div className='h-screen max-w-full bg-custom-grayFA'>
            <div className='flex flex-col gap-[20px]'>
                <div className='mt-[20px]'>
                    <p className='text-[24px] font-semibold'>{surveySummary?.survey_title}</p>
                </div>
                {surveySummary?.questions?.map((item, index) => (
                    <div key={index}>
                        <SummaryBar question={item} />
                    </div>
                ))}
                <div>
                    
                </div>
                
                

            </div>
        </div>
    )
}

export default SurveySummary