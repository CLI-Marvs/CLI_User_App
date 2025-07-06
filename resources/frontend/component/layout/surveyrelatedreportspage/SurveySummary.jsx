import React, { useEffect, useState } from 'react'
import SummaryBar from './surveyComponents/SummaryBar';

import { useParams } from 'react-router-dom';
import apiService from '../../servicesApi/apiService';
import SummaryLine from './surveyComponents/SummaryLine';
import SummaryRating from './surveyComponents/SummaryRating';
import SummaryTable from './surveyComponents/SummaryTable';
import SummaryTextboxTable from './surveyComponents/SummaryTextboxTable';
import SummaryVerticalBar from './surveyComponents/SummaryVerticalBar';
const SurveySummary = () => {

    const { id } = useParams();
    const [surveyId, setSurveyId] = useState(id || null);
    const [surveySummary, setSurveySummary] = useState(null);
    const [ratingCounts, setRatingCounts] = useState([]);

    useEffect(() => {
        if (!surveyId) return;

        apiService
            .get(`/survey-summary/${surveyId}`)
            .then((response) => {
                setSurveySummary(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching survey summary:', error);
                setSurveySummary(null);

            });
    }, [surveyId]);

    useEffect(() => {
        const fetchRatingCounts = async () => {
            try {

                const response = await apiService.get(`/experience-ratings/count/${surveyId}`);
                setRatingCounts(response.data.data);
            } catch (error) {
                console.error('Error fetching rating counts:', error);
            }
        };

        if (id) {
            fetchRatingCounts();
        }
    }, [id]);



    /*  function groupQuestionsByOptions(questions) {
         const groups = [];
 
         questions.forEach((question) => {
             const optionSignature = question.options.map(opt => opt.value).join('|');
             let existingGroup = groups.find(group => group.signature === optionSignature);
 
             if (existingGroup) {
                 existingGroup.questions.push(question);
             } else {
                 groups.push({
                     signature: optionSignature,
                     questions: [question]
                 });
             }
         });
 
         return groups;
     } */

    /* const groupedTables = surveySummary?.questions ? groupQuestionsByOptions(surveySummary.questions) : []; */


      function normalizeOptions(question) {
        // Skip if already 5 options
        if (question.options.length === 5) return question;
    
        // Only normalize questions with 10 options from 10 to 1
        const values = question.options.map(opt => Number(opt.value)).filter(Boolean);
        const isDescending10to1 = values.length === 10 && Math.max(...values) === 10 && Math.min(...values) === 1;
    
        if (!isDescending10to1) return question;
    
        const buckets = {
            'Very Satisfied': [10, 9],
            'Satisfied': [8, 7],
            'Neutral': [6, 5],
            'Dissatisfied': [4, 3],
            'Very Dissatisfied': [2, 1],
        };
    
        const groupedOptions = Object.entries(buckets).map(([label, values]) => {
            const count = question.options
                .filter(opt => values.includes(Number(opt.value)))
                .reduce((acc, opt) => acc + (opt.count || 0), 0);
    
            return {
                id: `${question.question_id}-${label}`,
                value: label,
                count,
            };
        });
    
        return {
            ...question,
            options: groupedOptions,
        };
    }
    
    function groupQuestionsByOptions(questions) {
        const groups = [];
        const ungrouped = [];
    
        questions.forEach((q) => {
            // Skip and store separately if no options
            if (!q.options || q.options.length === 0) {
                ungrouped.push(q);
                return;
            }
    
            const normalizedQuestion = normalizeOptions(q);
            const optionSignature = normalizedQuestion.options.map(opt => opt.value).join('|');
    
            let existingGroup = groups.find(group => group.signature === optionSignature);
    
            if (existingGroup) {
                existingGroup.questions.push(normalizedQuestion);
            } else {
                groups.push({
                    signature: optionSignature,
                    questions: [normalizedQuestion],
                });
            }
        });
    
        return { groups, ungrouped };
    }
    
    
    

    const { groups: groupedTables, ungrouped: ungroupedQuestions } = surveySummary?.questions
    ? groupQuestionsByOptions(surveySummary.questions)
    : { groups: [], ungrouped: [] };

    return (
        <div className='h-screen max-w-full bg-custom-grayFA'>
            <div className='flex flex-col gap-[20px]'>
                <div className='mt-[20px] mb-[10px]'>
                    <p className='text-[24px] font-semibold'>{surveySummary?.survey_title}</p>
                </div>
                <div>
                    <SummaryRating ratingCounts={ratingCounts} />
                </div>
                <div>
                    <SummaryTable groupedTables={groupedTables} />
                </div>
                
                {surveySummary?.questions?.map((item, index) => {
                    return (
                        <div key={index}>
                            {item?.input_type === "multiple-choice" && (
                                item?.options?.length > 5 ? (
                                    <SummaryLine question={item} />
                                ) : (
                                    <SummaryBar question={item} />
                                )
                            )}
                            {item?.input_type === "textbox" && (
                               <SummaryTextboxTable question={item} />
                            )}
                            {item?.input_type === "checkboxes" && (
                                <SummaryVerticalBar question={item} />
                            )}
                            
                        </div>
                    );
                })}
               
            </div>
        </div>
    )
}

export default SurveySummary