import React, { useState } from 'react'
import { useStateContext } from '../../../context/contextprovider'
import apiService from '../../servicesApi/apiService';

const AssignModal = ({modalRef, employeeData}) => {
    const {user, getInquiryLogs} = useStateContext();
    const [remarks, setRemarks] = useState("");

    const saveAssignee = async () => {
        try {
            const response = await apiService.post('add-assignee', {
                ...employeeData,
                assign_by: user?.firstname,
                assign_by_department: user?.department,
                remarks: remarks
            });
            getInquiryLogs(employeeData.ticketId);
            console.log("sucess");
        } catch (error) {
            console.log("error assigning", error);
        }
    };
  return (
    <dialog id="Assign" className="modal w-[557px] rounded-[10px] shadow-custom4" ref={modalRef}>
            <div className=' px-20 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-16">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className=' flex justify-center items-center mb-6'>
                    <p className='text-2xl montserrat-bold text-custom-solidgreen'>Remarks</p>
                </div>
                <div className='border border-b-1 border-gray-300 my-2'></div>
                <div className=' bg-custombg border'>
                    <div className='flex items-center justify-between'>
                        <p className='text-custom-gray81 pl-3 text-sm montserrat-semibold flex-grow'>Details</p>
                        <span className='bg-white text-sm2 text-gray-400 font-normal py-3 border pl-2 pr-12 ml-auto'>0/500 characters</span>
                    </div>
                    <div className='flex gap-3'>
                        <textarea onChange={(e) => setRemarks(e.target.value)}  value={remarks} id="message" rows="4" className="block border-t-1 h-40 p-2.5 w-full text-sm text-gray-900 bg-white"></textarea>
                    </div> 
                </div>
                <div className="mt-5 mb-12">
                    <form method="dialog" className='flex justify-end'>
                      
                        <button onClick={saveAssignee} className='h-12 text-white px-10 rounded-lg gradient-btn2 hover:shadow-custom4'>
                            Assign
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
  )
}

export default AssignModal