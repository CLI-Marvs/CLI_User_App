import React, { useEffect, useState } from 'react'
import SummaryBar from './surveyComponents/SummaryBar';

import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../servicesApi/apiService';
import SummaryLine from './surveyComponents/SummaryLine';
import SummaryRating from './surveyComponents/SummaryRating';
import SummaryTable from './surveyComponents/SummaryTable';
import SummaryTextboxTable from './surveyComponents/SummaryTextboxTable';
import SummaryVerticalBar from './surveyComponents/SummaryVerticalBar';
import SummaryRatingDetails from './surveyComponents/SummaryRatingDetails';
import { BiSolidLeftArrow } from 'react-icons/bi';
const SurveySummary = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [surveyId, setSurveyId] = useState(id || null);
    const [surveySummary, setSurveySummary] = useState(null);
    const [ratingCounts, setRatingCounts] = useState([]);

    const navigateToSurveyList = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (!surveyId) return;

        apiService
            .get(`/survey-summary/${surveyId}`)
            .then((response) => {
                setSurveySummary(response.data);
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

        questions.forEach((q, idx) => {
            if (!q.options || q.options.length === 0) {
                ungrouped.push(q);
                return;
            }

            const normalizedQuestion = normalizeOptions(q);
            normalizedQuestion.originalIndex = idx + 1; // 1-based index

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
            <div className='flex flex-col'>
                <div>
                    <div onClick={navigateToSurveyList} className='flex justify-center rounded-[10px] w-[32.96px] h-[32.96px] bg-custom-lightgreen text-white items-center cursor-pointer shrink-0 hover:shadow-custom3'>
                        <BiSolidLeftArrow className='size-[13px]' />
                    </div>
                </div>
                <div className='flex w-full mt-[10px] p-[3px]'>
                    <div className='h-[500px] p-[8px] rounded-[10px] shadow-custom7 border-[2px] w-full'>
                        <div className='mt-[20px] mb-[20px]'>
                            <p className='text-[24px] font-semibold'>{surveySummary?.survey_title}</p>
                        </div>
                        <div className='flex gap-[20px]'>
                            <div className='w-[400px]'>
                                <SummaryRating ratingCounts={ratingCounts} />
                            </div>
                            <div className='w-full'>
                                <SummaryRatingDetails />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full mt-[15px] p-[3px]'>
                    <div className='p-[8px] rounded-[10px] shadow-custom7 border-[2px] w-full'>
                        <SummaryTable groupedTables={groupedTables} />
                    </div>
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