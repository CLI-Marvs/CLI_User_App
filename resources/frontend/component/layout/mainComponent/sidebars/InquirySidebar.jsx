import React, { useRef } from 'react'
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { Link, useLocation } from 'react-router-dom';
import InquiryFormModal from '../../inquirypage/InquiryFormModal';



const InquirySidebar = () => {
    const location = useLocation();
    const modalRef = useRef(null);

    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };


    return (
        <>
            <div className='bg-custom-grayFA'>
                <Card className='flex min-w-52 h-screen pt-3 rounded-[10px] bg-customnavbar'>
                    <List className='flex flex-col justify-center w-full'>
                        <button onClick={handleOpenModal} className='flex items-center h-11 mx-6 my-3 py-2 justify-center text-white gradient-background3 montserrat-medium text-sm rounded-[10px] gap-1 hover:shadow-custom4'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Inquiry
                        </button>
                        <div className='px-5 leading-1'>
                            <div className='flex flex-col space-y-1 mt-1'>
                                <Link to="inquirylist">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full text-custom-solidgreen font-normal hover:font-semibold hover:bg-white ${location.pathname === '/inquirymanagement/inquirylist' || location.pathname.startsWith('/inquirymanagement/thread/') ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Inquiries
                                    </ListItem>
                                </Link>
                                <Link to="report">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${location.pathname === '/inquirymanagement/report' ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Reports
                                    </ListItem>
                                </Link>
                            </div>
                        </div>
                    </List>
                </Card>
                <div>
                    <InquiryFormModal modalRef={modalRef} />
                </div>
            </div>

        </>
    )
}

export default InquirySidebar