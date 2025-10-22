import React, { use, useEffect, useState } from 'react'
import SummaryBar from './surveyComponents/SummaryBar';
import { FiMessageSquare } from "react-icons/fi";
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../servicesApi/apiService';
import SummaryLine from './surveyComponents/SummaryLine';
import SummaryRating from './surveyComponents/SummaryRating';
import SummaryTable from './surveyComponents/SummaryTable';
import SummaryTextboxTable from './surveyComponents/SummaryTextboxTable';
import SummaryVerticalBar from './surveyComponents/SummaryVerticalBar';
import SummaryRatingDetails from './surveyComponents/SummaryRatingDetails';
import { BiSolidLeftArrow } from 'react-icons/bi';
import IndividualTable from './surveyComponents/IndividualTable';
import { Select } from '@mui/material';
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { RiEqualFill } from "react-icons/ri";
import { useSurvey } from '../../../context/Survey/SurveyContext';
const SurveySummary = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [surveyId, setSurveyId] = useState(id || null);
    const [surveySummary, setSurveySummary] = useState(null);
    const [ratingCounts, setRatingCounts] = useState([]);
    const [respondents, setRespondents] = useState(0);
    const [monthlyResponseChange, setMonthlyResponseChange] = useState(null);


    const { fetchRespondentsCount, fetchMonthlyResponseChange } = useSurvey();

    const navigateToSurveyList = () => {
        navigate(-1);
    };


    const fetchRespondents = async () => {
        const totalRespondents = await fetchRespondentsCount(surveyId);
        setRespondents(totalRespondents);
    };

    const fetchMonthlyResponse = async () => {
        const monthlyResponseChange = await fetchMonthlyResponseChange(surveyId);
        setMonthlyResponseChange(monthlyResponseChange);
    };

    useEffect(() => {
        fetchRespondents();
        fetchMonthlyResponse();
    }, []);


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
        let displayCounter = 1; // Only counts "real" table questions

        questions.forEach((q) => {
            if (!q.options || q.options.length === 0) {
                // This is likely a textbox or non-table question
                ungrouped.push(q);
                return;
            }

            const normalizedQuestion = normalizeOptions(q);

            // Assign displayCounter instead of raw index
            normalizedQuestion.originalIndex = displayCounter;
            displayCounter++;

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
            <div className='mb-2'>
                <div onClick={navigateToSurveyList} className='flex justify-center rounded-[10px] w-[32.96px] h-[32.96px] bg-custom-lightgreen text-white items-center cursor-pointer shrink-0 hover:shadow-custom3'>
                    <BiSolidLeftArrow className='size-[13px]' />
                </div>
            </div>
            <div className='px-[32px] py-[24px] bg-white'>
                <div className='flex flex-col gap-[6px]'>
                    <div>
                        <p className='text-[36px]'>CSAT Survey Turnover Dashboard</p>
                    </div>
                    <div>
                        <p>Updated Oct 15, 11:33 AM</p>
                    </div>
                </div>
            </div>
            <div className='p-[32px]'>
                <div className='flex flex-col gap-[40px] mb-[35px]'>
                    <div className='p-[20px] w-full bg-white'>
                        <div className='flex'>
                            <div className='w-[120px] flex justify-center items-center border'>
                                <p>filters</p>
                            </div>
                            <div className='w-full'>
                                <input type="text" className='w-full h-[32px] border' />
                            </div>
                            <div>
                                <Select className='w-[120px] h-[31px]'>
                                    <option value="">1 per page</option>
                                    <option value="1">5 per page</option>
                                    <option value="2">51 per page</option>
                                </Select>
                            </div>
                            <div className='flex justify-center items-center w-[120px]'>
                                <p>11 results</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                            <div className='flex flex-col justify-between h-full'>
                                <div className='flex justify-between'>
                                    <div className='flex flex-col gap-3'>
                                        <div>
                                            <p className='text-[#9A9A9A] text-sm'>Total Responses</p>
                                        </div>
                                        <div>
                                            <p className='montserrat-regular text-[36px] text-[#323232]'>{respondents}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                            <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                                <FiMessageSquare className='size-[20px]' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* TODO: When the filter is applied, this should be hidden */}
                                <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                                    <p className={`flex items-center 
                                        ${monthlyResponseChange?.direction === 'positive'
                                            ? 'text-[#3B82F6]'
                                            : monthlyResponseChange?.direction === 'negative'
                                                ? 'text-red-500'
                                                : 'text-[#3B82F6]'
                                        }
                                    
                                    `}
                                    >
                                        {
                                            monthlyResponseChange?.direction === 'positive'
                                                ? <IoMdArrowUp className='size-[15px]' />
                                                : monthlyResponseChange?.direction === 'negative'
                                                    ? <IoMdArrowDown className='size-[15px]'/>
                                                    : <RiEqualFill className='size-[15px]' />
                                            }
                                        &nbsp;
                                        {monthlyResponseChange?.percentage_change}
                                        </p>
                                    <p className=" text-[#9A9A9A]">vs last month</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white"></div>
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white"></div>
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white"></div>
                    </div>
                </div>
                <div className='p-[20px] flex flex-col gap-4 bg-white'>
                    <div className='flex justify-between '>
                        <div className='flex flex-col gap-[4px]'>
                            <div>
                                <p className='montserrat-medium text-[24px]'>Response Overview</p>
                            </div>
                            <div>
                                <p className='text-sm'>111 responses . Showing 1 -51</p>
                            </div>
                        </div>
                        <div className='flex gap-2 items-center'>
                            <div>
                                <button className='bg-custom-lightgreen text-white w-[122px] h-[35px]'>Export PDF</button>
                            </div>
                            <div>
                                <Select className=' w-[120px] h-[36px]'>
                                    <option value="">1 per page</option>
                                    <option value="1">5 per page</option>
                                    <option value="2">51 per page</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <input type="text" className='w-full border' />
                        <button className='border w-[180px] h-[36px] rounded-[10px]'>date range</button>
                        <Select className='w-[120px] h-[36px]'>
                            <option value="">1 per page</option>
                            <option value="1">5 per page</option>
                            <option value="2">51 per page</option>
                        </Select>
                    </div>
                </div>
                <div>
                    <IndividualTable />
                </div>
            </div>
            {/* ==================================================================================================================================================== */}
            {/* <div className='flex flex-col'>

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
            </div> */}
        </div>
    )
}

export default SurveySummary