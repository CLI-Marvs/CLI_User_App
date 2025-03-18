import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { SurveySection } from './surveyComponents/SurveySection';
const SurveyForm = () => {

  const navigate = useNavigate();

  const navigateToSurveyList = () => {
    navigate(-1);
  };

  const generateId = () => crypto?.randomUUID?.() || Date.now().toString();

  const initialSurveyData = [
    {
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
        },
      ],
    },
  ];

  const [surveyData, setSurveyData] = useState(initialSurveyData);


  // Update Survey Title
const updateTitle = (newTitle, sectionIndex) => {
  setSurveyData((prev) =>
    prev.map((survey, idx) =>
      idx === 0
        ? {
            ...survey,
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
                      id: generateId(), // Ensure unique ID
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

  
  
  
  
  

  const handleSubmit = () => {
    console.log("surveyData", surveyData[0]?.data);
  };


  return (
    <div className='h-screen max-w-full bg-custom-grayFA'>
      <div onClick={navigateToSurveyList} className='flex gap-[2px] items-center cursor-pointer mb-[20px] hover:underline'>
        <MdKeyboardArrowLeft />
        <p>Back to list</p>
      </div>
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
            />
          ))}
        </div>

        <div className='w-full border-b-1 border-custom-grayA5 my-[20px]'></div>

        <div className="mt-5 mb-[25px]">
          <div
            className="flex justify-center h-[31px] gap-[14px]"
          >
            <button className='h-[31px] w-[104px] gradient-btn2 p-[1px] rounded-[5px] text-sm hover:shadow-custom'>
              <div className='bg-white w-full h-full flex justify-center items-center rounded-[4px]'>
                Save
              </div>
            </button>
            <button onClick={handleSubmit} className='h-[31px] w-[104px] gradient-btn2 text-white rounded-[5px] text-sm hover:shadow-custom' >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyForm