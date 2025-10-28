import React, { useEffect, useState, useRef } from 'react'
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
import { LuTrendingUp } from "react-icons/lu";
import { FaRegStar } from "react-icons/fa";
import { RiErrorWarningLine } from "react-icons/ri";
import { CiFaceSmile } from "react-icons/ci";
import IndividualTable from './surveyComponents/IndividualTable';
import { Select } from '@mui/material';
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import { IoFunnelOutline } from "react-icons/io5";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { RiEqualFill } from "react-icons/ri";
import { useSurvey } from '../../../context/Survey/SurveyContext';
import Skeleton from 'react-loading-skeleton';
import FormResponsesTab from './surveyComponents/FormResponsesTab';
import DateRangeFilter from './surveyComponents/DateRangeFilter';
import EmojiResponsesTab from './surveyComponents/EmojiResponsesTab';
const SurveySummary = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [surveyId, setSurveyId] = useState(id || null);
    const [surveySummary, setSurveySummary] = useState(null);
    const [ratingCounts, setRatingCounts] = useState([]);
    const [respondents, setRespondents] = useState(0);
    const [monthlyResponseChange, setMonthlyResponseChange] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [highLowCount, setHighLowCount] = useState(null);
    const [surveyRatings, setSurveyRatings] = useState(null);
    const [activeTab, setActiveTab] = useState('form');
    const [surveyResponses, setSurveyResponses] = useState([]);


    const modalRef = useRef(null);

    const openModal = () => {
        modalRef.current.showModal();
    };


    const closeModal = () => {
        modalRef.current.close();
    };

    const {
        fetchRespondentsCount,
        fetchMonthlyResponseChange,
        fetchSurveysRatings,
        fetchHighLowCount,
        survey_title,
        survey_loading,
        fetchSurveyResponses,
        ratingDetails,
        fetchSurveyRatingDetails,
    } = useSurvey();

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

    const fetchAverageRating = async () => {
        const averageRating = await fetchSurveysRatings(surveyId);
        setAverageRating(averageRating);
    };

    const fetchHighLowCounts = async () => {
        const highLowCount = await fetchHighLowCount(surveyId);
        setHighLowCount(highLowCount);
    };

    const fetchSurveyResponse = async () => {
        const totalRespondents = await fetchSurveyResponses(surveyId);
        setSurveyResponses(totalRespondents);
    };

    const fetchSurveyRatings = async () => {
        const surveyRatings = await fetchSurveyRatingDetails(surveyId);
        setSurveyRatings(surveyRatings);
    };

    


    useEffect(() => {
        fetchRespondents();
        fetchMonthlyResponse();
        fetchAverageRating();
        fetchHighLowCounts();
        fetchSurveyResponse();
        fetchSurveyRatings();
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
        <div className='h-screen max-w-full bg-custom-grayFA viewport-container' >
            <div className='mb-2'>
                <div onClick={navigateToSurveyList} className='flex justify-center rounded-[10px] w-[32.96px] h-[32.96px] bg-custom-lightgreen text-white items-center cursor-pointer shrink-0 hover:shadow-custom3'>
                    <BiSolidLeftArrow className='size-[13px]' />
                </div>
            </div>
            <div className='px-[32px] py-[24px] bg-white'>
                <div className='flex flex-col gap-[6px]'>
                    <div>
                        <p className='text-[36px] montserrat-semibold'>
                            {survey_loading ?
                                <Skeleton width={300} />
                                :
                                (
                                    <span>{survey_title} Dashboard</span>
                                )}

                        </p>
                    </div>
                    <div>
                        <p>Updated Oct 15, 11:33 AM</p>
                    </div>
                </div>
            </div>
            <div className='p-[32px]'>
                <div className='flex flex-col gap-[40px] mb-[35px]'>
                    <div className='p-[20px] w-full bg-white border-[.6px] border-[#F4F4F4] h-[81px] rounded-[10px] '>
                        <div className='flex text-[#9A9A9A]'>
                            <div className='h-[40px] w-[120px] flex justify-center items-center gap-2 '>
                                <p><IoFunnelOutline /></p><p>filters</p>
                            </div>
                            <div className='w-full flex items-center gap-2 border px-[12px] border-[#F4F4F4]'>
                                <HiMiniMagnifyingGlass className='size-[16px]' /><input placeholder='Search email, ticket, or feedback...' type="text" className='w-full h-[32px] outline-none text-black' />
                            </div>
                            <div>
                                <button
                                    onClick={openModal}
                                    className="border w-[180px] h-[36px] rounded-[10px]"
                                >
                                    Date Range
                                </button>
                            </div>
                            <div>
                                <Select className='w-[120px] h-[31px]'>
                                    <option value="">1 per page</option>
                                    <option value="1">5 per page</option>
                                    <option value="2">51 per page</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* ======================================================KPI Widgets================================================================================= */}
                    <div className="flex gap-6">
                        {/* ======================================================total responses================================================================================= */}
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
                                                    ? <IoMdArrowDown className='size-[15px]' />
                                                    : <RiEqualFill className='size-[15px]' />
                                        }
                                        &nbsp;
                                        {monthlyResponseChange?.percentage_change}
                                    </p>
                                    <p className=" text-[#9A9A9A]">vs last month</p>
                                </div>
                            </div>
                        </div>

                        {/* ======================================================average rating================================================================================= */}
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                            <div className='flex flex-col justify-between h-full'>
                                <div className='flex justify-between'>
                                    <div className='flex flex-col gap-3'>
                                        <div>
                                            <p className='text-[#9A9A9A] text-sm'>Average Rating</p>
                                        </div>
                                        <div>
                                            <p className='montserrat-regular text-[36px] text-[#323232]'>{averageRating?.average_rating}/5</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                            <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                                <LuTrendingUp className='size-[20px]' />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                                    <p className=" text-[#9A9A9A]">Out of 5 stars</p>
                                </div>
                            </div>
                        </div>

                        {/* ======================================================5-star rating================================================================================= */}
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                            <div className='flex flex-col justify-between h-full'>
                                <div className='flex justify-between'>
                                    <div className='flex flex-col gap-3'>
                                        <div>
                                            <p className='text-[#9A9A9A] text-sm'>5-Star Rating</p>
                                        </div>
                                        <div>
                                            <p className='montserrat-regular text-[36px] text-[#323232]'>{highLowCount?.highest_rated_count}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                            <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                                <FaRegStar className='size-[20px]' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                                    <p className=" text-[#9A9A9A]">Highest rating responses</p>
                                </div>
                            </div>
                        </div>
                        {/*============================================================1 tar rating============================================================================ */}
                        <div className="flex-1 h-[179px] rounded-[10px] border border-[#F4F4F4] p-[24px] bg-white">
                            <div className='flex flex-col justify-between h-full'>
                                <div className='flex justify-between'>
                                    <div className='flex flex-col gap-3'>
                                        <div>
                                            <p className='text-[#9A9A9A] text-sm'>1-Star Rating</p>
                                        </div>
                                        <div>
                                            <p className='montserrat-regular text-[36px] text-[#323232]'>{highLowCount?.lowest_rated_count}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='w-[40px] h-[40px] rounded-[8px] p-[10px] bg-custom-lightestgreen justify-center items-center'>
                                            <div className='flex justify-center h-full w-full items-center text-[#348017]'>
                                                <RiErrorWarningLine className='size-[32px]' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-[7.2px] h-[30px] border-t border-[#F4F4F4] items-center text-[14px]">
                                    <p className=" text-[#9A9A9A]">Lowest rating responses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ======================================================================================================================================= */}
                </div>
                <div className="flex flex-col w-full gap-6">

                    <div className="flex gap-4 ">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={` h-[37px] border px-5 py-2 rounded-[4px] transition-all duration-200 flex gap-[8px] items-center
                                ${activeTab === 'form'
                                    ? 'bg-custom-solidgreen text-white border-custom-solidgreen'
                                    : 'bg-white text-[#323232] hover:bg-gray-100'
                                }`}
                        >
                            <FiMessageSquare className='size-[20px]' />
                            Form Responses
                            <span className={`flex items-center  min-w-[24px] h-[20px] rounded-[4px] py-[2px] px-[8px] text-sm 
                                ${activeTab === 'form'
                                    ? 'bg-white text-black'
                                    : 'bg-custom-solidgreen text-white'
                                }
                                `}>{surveyResponses?.data?.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('emoji')}
                            className={` h-[37px] border px-5 py-2 rounded-[4px] transition-all duration-200 flex gap-[8px] items-center
                                ${activeTab === 'emoji'
                                    ? 'bg-custom-solidgreen text-white border-custom-solidgreen'
                                    : 'bg-white text-[#323232] hover:bg-gray-100'
                                }`}
                        >
                           <CiFaceSmile className='size-[20px]' />
                           Emoji Only Responses
                            <span className={`flex items-center  min-w-[24px] h-[20px] rounded-[4px] py-[2px] px-[8px] text-sm 
                                ${activeTab === 'emoji'
                                    ? 'bg-white text-black'
                                    : 'bg-custom-solidgreen text-white'
                                }
                                `}>{surveyRatings?.data?.length}</span>
                        </button>
                    </div>
                    <div>
                        {activeTab === 'form' && (
                            <FormResponsesTab surveyResponses={surveyResponses} />
                        )}
                        {activeTab === 'emoji' && (
                            <EmojiResponsesTab surveyRatings={surveyRatings} />
                        )}
                    </div>
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
            <div>
                <DateRangeFilter closeModal={closeModal} modalRef={modalRef} />
            </div>
        </div>
    )
}

export default SurveySummary