import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { SurveySection } from './surveyComponents/SurveySection';
import { showToast } from "../../../util/toastUtil";
import apiService from '../../servicesApi/apiService';
import Spinner from '../../../util/Spinner';
import { CircularProgress } from '@mui/material';
const SurveyForm = () => {

  const { id } = useParams();

  const [surveyId, setSurveyId] = useState(id || null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  

  const generateId = () => crypto?.randomUUID?.() || Date.now().toString();

  const initialSurveyData = [
    {
      surveyLink: generateId(),
      surveyTitle: "",
      status: false,
      data: [
        {
          title: "Untitled Form",
          description: "",
          dataQASet: [
            {
              id: generateId(),
              question: "",
              inputType: "dropdown",
              option: [
                {
                  id: generateId(),
                  text: "",
                },
              ],
              required: false,
            },
          ],
          consentTitle: "Declaration and Consent",
          consentDescription: "I hereby agree and consent to CLI and its authorized personnel collecting, storing, and processing the personal data I have provided in this form. This is for the purpose of proper identification and customer satisfaction reporting.",
        },
      ],
    },
  ];

  const [surveyData, setSurveyData] = useState([]);



  useEffect(() => {
    if (surveyId) {
      apiService
        .get(`/fetch-survey/${surveyId}`)
        .then((response) => {
          setSurveyData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching survey:", error);
          setSurveyData(initialSurveyData);
        });
    } else {
      setSurveyData(initialSurveyData);
    }
  }, [id]);


  // Update Survey Title
  const updateTitle = (newTitle, sectionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, idx) =>
        idx === 0
          ? {
            ...survey,
            surveyTitle: newTitle,
            data: survey.data.map((item, i) =>
              i === sectionIndex ? { ...item, title: newTitle } : item
            ),
          }
          : survey
      )
    );
  };

  // Update Survey Description
  const updateDescription = (newDescription, sectionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, idx) =>
        idx === 0
          ? {
            ...survey,
            data: survey.data.map((item, i) =>
              i === sectionIndex
                ? { ...item, description: newDescription }
                : item
            ),
          }
          : survey
      )
    );
  };


  const addQuestion = (sectionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: [
                    ...section.dataQASet,
                    {
                      id: generateId(),
                      question: "",
                      inputType: "dropdown",
                      option: [{
                        id: generateId(),
                        text: "",
                      }
                      ],
                      required: false,
                    },
                  ],
                }
                : section
            ),
          }
          : survey
      )
    );
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.filter(
                    (_, qIndex) => qIndex !== questionIndex
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };

  const addOption = (sectionIndex, questionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.map((question, qIdx) =>
                    qIdx === questionIndex
                      ? {
                        ...question,
                        option: [
                          ...question.option,
                          {
                            id: generateId(),
                            text: "",
                          },
                        ],
                      }
                      : question
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };


  const deleteOption = (sectionIndex, questionIndex, optionId) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.map((question, qIdx) =>
                    qIdx === questionIndex
                      ? {
                        ...question,
                        option: question.option.filter(
                          (option) => option.id !== optionId
                        ),
                      }
                      : question
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };


  const updateQuestionText = (sectionIndex, questionIndex, newText) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.map((question, qIdx) =>
                    qIdx === questionIndex
                      ? { ...question, question: newText } // Update question text
                      : question
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };


  const updateOptionText = (sectionIndex, questionIndex, optionId, newText) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.map((question, qIdx) =>
                    qIdx === questionIndex
                      ? {
                        ...question,
                        option: question.option.map((option) =>
                          option.id === optionId
                            ? { ...option, text: newText } // ✅ Update text
                            : option
                        ),
                      }
                      : question
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };


  const updateIsRequired = (sectionIndex, questionIndex, isRequired) => {
    setSurveyData((prev) =>
      prev.map((survey, surveyIndex) =>
        surveyIndex === 0
          ? {
            ...survey,
            data: survey.data.map((section, idx) =>
              idx === sectionIndex
                ? {
                  ...section,
                  dataQASet: section.dataQASet.map((question, qIdx) =>
                    qIdx === questionIndex
                      ? { ...question, required: isRequired }
                      : question
                  ),
                }
                : section
            ),
          }
          : survey
      )
    );
  };

  const updateConsentTitle = (newConsentTitle, sectionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, idx) =>
        idx === 0
          ? {
            ...survey,
            data: survey.data.map((item, i) =>
              i === sectionIndex
                ? { ...item, consentTitle: newConsentTitle }
                : item
            ),
          }
          : survey
      )
    );
  };

  const updateConsentDescription = (newConsentDescription, sectionIndex) => {
    setSurveyData((prev) =>
      prev.map((survey, idx) =>
        idx === 0
          ? {
            ...survey,
            data: survey.data.map((item, i) =>
              i === sectionIndex
                ? { ...item, consentDescription: newConsentDescription }
                : item
            ),
          }
          : survey
      )
    );
  };



  const handleSave = async () => {
    try {

      setLoading1(true);
      if (surveyId) {
        await apiService.put(`/surveys/${surveyId}`, { surveyData });
        showToast("Data updated successfully!", "success");
      } else {
        const response = await apiService.post('/surveys', { surveyData });
        setSurveyId(response.data.survey_id);
        showToast("Data created successfully!", "success");
        
      }
    } catch (error) {
      showToast("Error saving survey!", "error");
    } finally {
      setLoading1(false);
    }
  };




  const handlePublish = async () => {
    try {

      setLoading2(true);
      const updatedSurveyData = surveyData.map((survey, idx) =>
        idx === 0 ? { ...survey, status: !survey.status } : survey
      );

      setSurveyData(updatedSurveyData); // Update state

      try {
        if (surveyId) {
          await apiService.put(`/surveys/${surveyId}`, { surveyData: updatedSurveyData });
          showToast("Data updated successfully!", "success");
        } else {
          const response = await apiService.post('/surveys', { surveyData: updatedSurveyData });
          setSurveyId(response.data.survey_id);
          showToast("Data created successfully!", "success");
        }
      } catch (error) {
        showToast("Error saving survey!", "error");
      }
    } catch (error) {
      showToast("Error saving survey!", "error");
    } finally {
      setLoading2(false);
    }
  };



  return (
    <div className='h-screen max-w-full bg-custom-grayFA'>
      
      <div className='flex flex-col max-w-[687px]'>
        <div className='flex flex-col'>
          {surveyData[0]?.data?.map((item, index) => (
            <SurveySection
              key={index}
              data={item}
              sectionIndex={index}
              addQuestion={addQuestion}
              deleteQuestion={deleteQuestion}
              addOption={addOption}
              deleteOption={deleteOption}
              updateQuestionText={updateQuestionText}
              updateOptionText={updateOptionText}
              updateIsRequired={updateIsRequired}
              updateTitle={updateTitle}
              updateDescription={updateDescription}
              updateConsent={updateConsentTitle}
              updateConsentDescription={updateConsentDescription}
            />
          ))}
        </div>

        <div className='w-full border-b-1 border-custom-grayA5 my-[20px]'></div>

        <div className="mt-5 mb-[25px]">
          <div
            className="flex justify-center h-[31px] gap-[14px]"
          >
            <button className='h-[31px] w-[104px] gradient-btn2 p-[1px] rounded-[5px] text-sm hover:shadow-custom'>
              <div onClick={handleSave} className='bg-white w-full h-full flex justify-center items-center rounded-[4px]'>
               {loading1 ? <CircularProgress className="spinnerSize" /> : "Save"}
              </div>
            </button>


            <button
              onClick={handlePublish}
              className={`h-[31px] w-[104px] text-white rounded-[5px] text-sm hover:shadow-custom
                ${surveyData[0]?.status ? "bg-red-500 " : "gradient-btn2"}
              `}
            >
              {   loading2 ? <CircularProgress className="spinnerSize" /> : surveyData[0]?.status ? "Unpublish " : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyForm