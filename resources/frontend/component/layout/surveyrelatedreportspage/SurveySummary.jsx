import React, { useEffect, useState } from 'react'
import SummaryBar from './surveyComponents/SummaryBar';

import { useParams } from 'react-router-dom';
import apiService from '../../servicesApi/apiService';
import SummaryLine from './surveyComponents/SummaryLine';
import SummaryRating from './surveyComponents/SummaryRating';
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

            })
            .catch((error) => {
                console.error('Error fetching survey summary:', error);
                setSurveySummary(null);

            });
    }, [surveyId]);

    useEffect(() => {
        const fetchRatingCounts = async () => {
          try {
            const response = await apiService.get('/experience-ratings/count');
            setRatingCounts(response.data.data);
          } catch (error) {
            console.error('Error fetching rating counts:', error);
          }
        };
    
        fetchRatingCounts();
      }, []);



    function groupQuestionsByOptions(questions) {
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
    }

    const groupedTables = surveySummary?.questions ? groupQuestionsByOptions(surveySummary.questions) : [];

    return (
        <div className='h-screen max-w-full bg-custom-grayFA'>
            <div className='flex flex-col gap-[20px]'>
                <div className='mt-[20px]'>
                    <p className='text-[24px] font-semibold'>{surveySummary?.survey_title}</p>
                </div>
                <SummaryRating ratingCounts={ratingCounts} />
                {groupedTables.map((group, index) => (
                    <div key={index} className="mb-8">
                        {/* <h2 className="text-lg font-semibold mb-2">Table {index + 1}</h2> */}
                        <table className="w-full table-fixed border">
                            <thead>
                                <tr>
                                    <th className="w-[150px] border px-2 py-1 text-center"></th>
                                    {group.questions[0].options.map(opt => (
                                        <th key={opt.id} className="w-[150px] border px-2 py-1 text-center"> {opt.value}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {group.questions.map((q) => (
                                    <tr key={q.question_id}>
                                        <td className="w-[150px] border px-2 py-1 text-center">Question {q.question.charAt(0)}</td>
                                        {q.options.map(opt => (
                                            <td key={opt.id} className="w-[150px] border px-2 py-1 text-center">{opt.count}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
                {surveySummary?.questions?.map((item, index) => {
                    return (
                        <div key={index}>
                            {item?.options?.length > 5 ? (
                                <SummaryLine question={item} />
                            ) : (
                                <SummaryBar question={item} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default SurveySummary