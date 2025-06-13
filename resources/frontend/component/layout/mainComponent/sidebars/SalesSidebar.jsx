import React from 'react'
import { Link, useLocation } from 'react-router-dom';
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
const SalesSidebar = () => {

    const location = useLocation();
  return (
    <>
            <div className='bg-custom-grayFA'>
                <Card className='flex min-w-[230px] h-screen pt-3 rounded-[10px] bg-customnavbar'>
                    <List className='flex flex-col justify-center w-full'>
                        <div className='px-5 leading-1'>
                            <div className='flex flex-col space-y-1 mt-1'>
                                <Link to="customer">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full text-custom-solidgreen font-normal hover:font-semibold ${location.pathname === '/sales/customer' || location.pathname.startsWith('/sales/customer') ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Customer Master List
                                    </ListItem>
                                </Link>
                              {/*   <Link to="">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold ${location.pathname === '/inquirymanagement/report' ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Client Master
                                    </ListItem>
                                </Link> */}
                                <Link to="reservationlist">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold ${location.pathname === '/inquirymanagement/report' ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Reservations
                                    </ListItem>
                                </Link>
                                <Link to="">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold ${location.pathname === '/inquirymanagement/report' ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Take-outs
                                    </ListItem>
                                </Link>
                                <Link to="">
                                    <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold ${location.pathname === '/inquirymanagement/report' ? 'text-custom-solidgreen font-semibold bg-white' : 'hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen '}`}>
                                        Cancellations
                                    </ListItem>
                                </Link>
                            </div>
                        </div>
                    </List>
                </Card>
            </div>

        </>
  )
}

export default SalesSidebar