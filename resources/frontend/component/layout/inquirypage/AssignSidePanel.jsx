import React,{useEffect, useRef} from 'react'
import AssignDetails from './AssignDetails'
import AssignModal from './AssignModal';
import { useStateContext } from '../../../context/contextprovider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


const AssignSidePanel = ({ticketId}) => {
    const { setTicketId, logs} = useStateContext();

    const logsMessages = logs[ticketId] || [];

    const modalRef = useRef(null);

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    console.log("logs", logs);

    useEffect(() => {
        setTicketId(ticketId);
    }, [ticketId, setTicketId]);

    const options = ['Sho', 'Kent' , 'gabz', 'brother john','willson' , 'kyla' , 'kin' , 'kai', 'james', 'jay' , 'jhunax', 'clavel' ,'mark kevin' ,'eden', 'suzette'];
    
    return (
        <>
            <div className='w-full '>
                <div>
                    <Autocomplete
                        disablePortal
                        options={options}
                        className='w-full rounded-[5px]'
                        renderInput={(params) => <TextField {...params} label="Assign To" size="small" className='w-full rounded-[5px]' />}
                 />
                </div>
                <div className='flex w-full justify-center items-center p-4'>
                    <button onClick={handleOpenModal} className='h-9 gradient-btn2 px-16 text-white rounded-lg'>
                        Assign
                    </button>
                </div>
                <div className='border border-t-1 border-custom-lightestgreen'></div>
                <div className='flex h-12 w-full gap-5 items-center justify-center mt-1'>
                    <div className='flex w-36 justify-end'>
                        <p className='text-xl text-custom-bluegreen montserrat-semibold'>(21 days ago)</p>
                    </div>
                </div>
                <div className="h-full flex flex-col">
                    <div className="h-90 overflow-y-auto">
                        <AssignDetails logMessages={logsMessages}/>
                    </div>
                    <div className="border border-t-1 border-custom-lightestgreen flex-shrink-0"></div>
                </div>
            </div>
            <div>
                <AssignModal modalRef={modalRef}/>
            </div>
        </>
    )
}

export default AssignSidePanel