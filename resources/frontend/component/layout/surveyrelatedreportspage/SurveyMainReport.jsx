import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer,
    LabelList,
    Customized
} from 'recharts';
import { MdSearch } from "react-icons/md";
import apiService from '../../servicesApi/apiService';


const emojiMap = {
    5: '😃',
    4: '😊',
    3: '😐',
    2: '😒',
    1: '😠',
};


const SurveyMainReport = () => {

    const navigate = useNavigate();


    const [surveysRespondents, setSurveysRespondents] = useState([]);
    const [surveysRatings, setSurveysRatings] = useState([]);


    useEffect(() => {
        fetchSurveys();
        fetchSurveysRatings();
    }, []);

    const fetchSurveys = async () => {
        try {
            const response = await apiService.get('/surveys-count/respondents');
            setSurveysRespondents(response.data.data);
        } catch (error) {
            console.error('Error fetching surveys respondents', error);
        }
    };

    const fetchSurveysRatings = async () => {
        try {
            const response = await apiService.get('/surveys-count/ratings');
            setSurveysRatings(response.data.data);
        } catch (error) {
            console.error('Error fetching surveys ratings', error);
        }
    };

    const barHeight = 40;
    const gapHeight = 28;
    const extraPadding = 40;
    const chartHeight = surveysRespondents.length * (barHeight + gapHeight) + extraPadding;

    return (
        <div className='h-screen max-w-full bg-custom-grayFA'>
            <div className='flex flex-col p-[30px]'>
                <div>
                    <div className='w-full h-[600px]'>
                        <div>
                            <div className="flex flex-col gap-[16px] pt-[18px] px-[16px]">
                                <div className="p-[10.9px] border-b-[0.5px] border-[#3A3A3A]">
                                    <p className="montserrat-medium text-[24px] font-[#3A3A3A]">
                                        Respondents Summary
                                    </p>
                                </div>
                                <div className=" w-full" style={{ height: chartHeight }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={surveysRespondents}
                                            margin={{ top: 20, right: 100, left: 0, bottom: 20 }}
                                            barCategoryGap={gapHeight}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="survey_title"
                                                type="category"
                                                width={180}
                                                color='black'
                                                tick={{ width: 160, wordBreak: 'break-word' }}
                                            />
                                            <Bar
                                                dataKey="respondents_count"
                                                barSize={barHeight}
                                                radius={[0, 4, 4, 0]}
                                                fill="#429E1F"

                                            >
                                                <LabelList
                                                    dataKey="respondents_count"
                                                    content={({ x, y, value, width, height, index }) => {
                                                        const entry = surveysRespondents[index];
                                                        const handleClick = () => {
                                                            navigate(`/inquirymanagement/report/survey/${entry.id}`);
                                                        };

                                                        return (
                                                            <>
                                                                {/* Count text */}
                                                                <text
                                                                    x={x + width + 8}
                                                                    y={y + height / 2}
                                                                    fill="#333"
                                                                    fontSize={16}
                                                                    fontWeight="bold"
                                                                    textAnchor="start"
                                                                    dominantBaseline="middle"
                                                                >
                                                                    {value}
                                                                </text>

                                                                {/* Clickable link text */}
                                                                <text
                                                                    x={x + width + 50}
                                                                    y={y + height / 1.75}
                                                                    fill="#429E1F"
                                                                    fontSize={14}
                                                                    textDecoration="underline"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={handleClick}
                                                                >
                                                                    View
                                                                </text>
                                                            </>
                                                        );
                                                    }}
                                                />
                                            </Bar>
                                            
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='w-full h-[600px]'>
                        <div>
                            <div className="flex flex-col gap-[16px] pt-[18px] px-[16px]">
                                <div className="p-[10.9px] border-b-[0.5px] border-[#3A3A3A]">
                                    <p className="montserrat-medium text-[24px] font-[#3A3A3A]">
                                        Initial Survey Summary
                                    </p>
                                </div>
                                <div>
                                    <div className="mb-8">
                                        <table className="w-full border-2">
                                            <thead>
                                                <tr>
                                                    <th className="border-2 px-2 py-1 text-center">Survey Name</th>
                                                    {[5, 4, 3, 2, 1].map(rating => (
                                                        <th key={rating} className="border-2 px-2 py-1 text-center text-[24px]">
                                                            {emojiMap[rating]}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {surveysRatings.map((survey, idx) => (
                                                    <tr key={idx}>
                                                        <td className="w-[350px] border-2 px-2 py-1 text-center">{survey.survey_title}</td>
                                                        {[5, 4, 3, 2, 1].map(rating => (
                                                            <td key={rating} className="border-2 px-2 py-1 text-center">
                                                                {survey.ratings?.[rating] ?? 0}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SurveyMainReport