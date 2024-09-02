import React,{useRef} from 'react'
import UploadUnitDetailsModal from './UploadUnitDetailsModal';

const ProjectDetails = () => {

    const modalRef = useRef(null);

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    return (
        <>
            <div className='min-w-full h-[138px] bg-custom-lightestgreen p-[20px] rounded-[10px] '>
                <div className='h-full flex flex-col justify-between'>
                    <div className='flex gap-1'>
                        <div>
                            <p className='text-sm font-semibold text-custom-bluegreen w-[120px]'>Property Name</p>
                        </div>
                        <div className='h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]'>
                            <p className='text-custom-gray81 text-xs'>38 Park Avenue</p>
                        </div>
                    </div>
                    <div className='flex gap-1'>
                        <div>
                            <p className='text-sm font-semibold text-custom-bluegreen w-[120px]'>Type</p>
                        </div>
                        <div className='h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]'>
                            <p className='text-custom-gray81 text-xs'>Vertical</p>
                        </div>
                    </div>
                    <div className='flex gap-1'>
                        <div>
                            <p className='text-sm font-semibold text-custom-bluegreen w-[120px]'>Tower/Phase</p>
                        </div>
                        <div className=' w-auto h-[26px] px-[15px] py-[5px] bg-white rounded-[5px]'>
                            <p className=' text-custom-gray81 text-xs'>Tower 1</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-[15px] py-5'>
                <button onClick={handleOpenModal} className='h-[37px] w-[162px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4'>Upload Unit Details</button>
                <button className='h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4'>Submit for Approval</button>
                <button className='h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 p-[3px]'>
                    <div className='flex justify-center items-center h-full w-full rounded-[8px] bg-white'>
                        Save as Draft
                    </div>
                </button>
            </div>
            <div>
                <UploadUnitDetailsModal modalRef={modalRef}/>
            </div>
        </>

    )
}

export default ProjectDetails