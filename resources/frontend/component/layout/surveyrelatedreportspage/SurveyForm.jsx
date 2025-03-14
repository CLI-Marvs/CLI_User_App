import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { IoMdRadioButtonOn } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { MdContentCopy } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { SurveySection } from './surveyComponents/SurveySection';
const SurveyForm = () => {

  const navigate = useNavigate();

  const navigateToSurveyList = () => {
    navigate(-1);
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSections] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState("Untitled Form");
  const [sectionTitle, setSectionTitle] = useState("Untitled Form");

  const generateId = () => crypto?.randomUUID?.() || Date.now().toString();

  const initialSurveyData = [
    {
      surveyTitle: "",
      status: false,
      data: [
        {
          Title: "",
          Description: "",
          dataQASet: [
            {
              id: generateId(),
              question: "New Question",
              inputType: "dropdown",
              option: [],
              required: false,
            },
          ],
        },
      ],
    },
  ];

  const [surveyData, setSurveyData] = useState(initialSurveyData);

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
                          question: "New Question",
                          option: [],
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
                      dataQASet: section.dataQASet
                        .filter((_, qIndex) => qIndex !== questionIndex)
                        .map((item, newIndex) => ({
                          ...item,
                          index: newIndex, // Reset index after deletion
                        })),
                    }
                  : section
              ),
            }
          : survey
      )
    );
  };
  






  const handleSubmit = () => {
    console.log("surveyData", surveyData[0]?.data[0]?.dataQASet);
  };


  return (
    <div className='h-screen max-w-full bg-custom-grayFA'>
      <div onClick={navigateToSurveyList} className='flex gap-[2px] items-center cursor-pointer mb-[20px] hover:underline'>
        <MdKeyboardArrowLeft />
        <p>Back to list</p>
      </div>
      <div className='flex flex-col max-w-[687px]'>
        <div className='flex flex-col gap-[80px]'>
          {surveyData[0]?.data?.map((item, index) => (
            <SurveySection
              key={index}
              data={item}
              sectionIndex={index}
              addQuestion={addQuestion}
              deleteQuestion={deleteQuestion}
            />
          ))}
        </div>

        <div className='w-full border-b-1 border-custom-grayA5 my-[20px]'></div>

        <div className="mt-5 mb-[25px]">
          <div
            className="flex justify-center h-[31px] gap-[14px]"
          >
            <button className='h-[31px] w-[104px] gradient-btn2 p-[1px] rounded-[5px] text-sm'>
              <div className='bg-white w-full h-full flex justify-center items-center rounded-[4px]'>
                Save
              </div>
            </button>
            <button onClick={handleSubmit} className='h-[31px] w-[104px] gradient-btn2 text-white rounded-[5px] text-sm' >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SurveyForm