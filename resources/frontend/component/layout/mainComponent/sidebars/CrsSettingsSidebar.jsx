
import React from 'react'
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

const CrsSettingsSidebar = () => {

    const location = useLocation();

    return (
        <>
            <div className='bg-custom-grayFA'>
                <Card className='flex min-w-[189px] h-screen pt-3 rounded-[10px] bg-[#EFEFEF]'>
                    <List className='flex flex-col justify-center w-full'>
                        <div className='px-5 leading-1'> 
                            <div className='flex flex-col space-y-1 mt-1'>
                                <Link to="bannersettings">
                                    <ListItem className={`h-[39px] w-[157px] mb-[5px] flex justify-center gap-2 rounded-[10px] ${location.pathname === '/inquirymanagement/settings/bannersettings' ? 'text-[15px] font-semibold bg-white shadow-custom6' : 'text-[15px] text-[#8A8888]'}`}>
                                       Banner Settings
                                    </ListItem>
                                </Link>
                                <Link to="autoassign">
                                    <ListItem className={`hidden h-[39px] w-[157px] mb-[5px] justify-center gap-2 rounded-[10px] ${location.pathname === '/inquirymanagement/settings/autoassign'  ? 'text-[15px] font-semibold bg-white shadow-custom6' : ' text-[15px] text-[#8A8888]'}`}>
                                       Auto Assign
                                    </ListItem>
                                </Link>
                                <Link to="versionlogs">
                                    <ListItem className={`h-[39px] w-[157px] mb-[5px] flex justify-center gap-2 rounded-[10px] ${location.pathname === '/inquirymanagement/settings/versionlogs'  ? 'text-[15px] font-semibold bg-white shadow-custom6' : ' text-[15px] text-[#8A8888]'}`}>
                                       Version Logs
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

export default CrsSettingsSidebar