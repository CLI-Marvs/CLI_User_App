import { dialog } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'

const SurveyEditModal = ({ modalRef, surveyData, handleCloseModal , handleUpdateTitle }) => {
    const [newTitle, setNewTitle] = useState('')

    useEffect(() => {
    
        if (surveyData?.survey_title) {
            setNewTitle(surveyData.survey_title)
        }
    }, [surveyData])

    const handleInputChange = (e) => {
        setNewTitle(e.target.value)
    }

    const handleSave = () => {
        
        handleUpdateTitle(surveyData.id, newTitle);
        handleCloseModal();
    }

    return (
        <dialog
            id="Survey"
            className="modal w-[469px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
            <div className="px-[25px] pb-[24px] rounded-lg">
                <div className="flex flex-col gap-[20px]">
                    <form
                        method="dialog"
                        className="pt-1 flex justify-end -mr-6"
                    >
                        <button className="absolute justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                    <div>
                        <p className='text-[32px]'>Rename Survey</p>
                    </div>
                    <div>
                        <p className='text-[18px] text-gray-400'>Please enter a new name for the item:</p>
                    </div>
                    <div>
                        <input
                            value={newTitle}
                            onChange={handleInputChange}
                            type="text"
                            className="w-full h-10 px-2 text-sm border montserrat-medium flex justify-center items-center gap-1 hover:shadow-custom"
                        />
                    </div>
                    <div className="flex justify-center space-x-[19px] pb-[3px]">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                        >
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm hover:shadow-custom4">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold hover:shadow-custom4"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    )
}

export default SurveyEditModal
