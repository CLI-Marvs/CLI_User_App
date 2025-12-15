import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { showToast } from "../../../util/toastUtil";
import { SurveyList } from './surveyComponents/SurveyList';
import apiService from '@/servicesApi/apiService';


const SurveyReports = () => {

    const navigate = useNavigate();

    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = () => {
        apiService.get("/fetch-surveys")
            .then((response) => {
                setSurveys(response.data);
            })
            .catch((error) => {
                console.error("Error fetching surveys:", error);
            });
    };

    const navigateToSurveyForm = () => {
        navigate("/inquirymanagement/settings/surveysettings/surveyform");
    };

    const handleUpdateTitle = async (id, newTitle) => {
        try {
            await apiService.put(`/surveys/${id}/update-title`, {
                surveyTitle: newTitle
            });
            showToast("Survey title updated successfully!", "success");
            fetchSurveys();
        } catch (error) {
            showToast("Error updating survey title!", "error");
            console.error("Error updating survey title:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiService.delete(`/surveys/${id}`);
            showToast("Survey deleted successfully!", "success");
            fetchSurveys();
        } catch (error) {
            showToast("Error deleting survey!", "error");
            console.error("Error deleting survey:", error);
        }
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
                    {[...surveys]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .map((survey, index) => (
                            <SurveyList
                                key={survey.id}
                                data={survey}
                                handleDelete={handleDelete}
                                handleUpdateTitle={handleUpdateTitle}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}

export default SurveyReports