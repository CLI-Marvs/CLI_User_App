import React, {useState} from 'react'

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
import { Link } from 'react-router-dom';
const Sidebar = () => {

  const [activeItem, setActiveItem] = useState(null);


  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <>
      <Card className=" w-[230px] max-w-[230px] p-4 pt-0 rounded-none bg-custombg">
        <List className='px-3 mt-6'>
          <ListItem className='flex text-sm items-center h-[39px] pl-5 gap-2 rounded-[50px] text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold'>
            Notifications
            <ListItemSuffix>
              <Chip
                value="120"
                size="sm"
                variant="ghost"
                color="blue-gray"
                className="rounded-md gradient-btn2 mr-32 text-white"
              />
            </ListItemSuffix>
          </ListItem>
          <Link to="/inquirymanagement/inquirylist">
            <ListItem
              className={`h-[39px] text-sm mb-2 pl-5 gap-2 rounded-[50px] ${activeItem === 'inquiry' ? 'bg-custom-lightestgreen text-custom-solidgreen font-semibold' : 'text-custom-solidgreen'} hover:bg-custom-lightestgreen hover:font-semibold`}
              onClick={() => handleItemClick('inquiry')}
            >
              Inquiry Management
            </ListItem>
          </Link>
          <div className='mt-3 mb-1 px-4'>
            <p className='text-[14px] font-bold bg-gradient-to-r from-custom-bluegreen via-custom-lightgreen to-custom-solidgreen bg-clip-text text-transparent'>Coming Soon</p>
          </div>
          <div className=' text-sm p-4 h-auto rounded-[10px] text-gray-400 border border-custom-lightestgreen flex flex-col gap-4 cursor-not-allowed'>
            <p>Property & Pricing</p>
            <p>Sales Management</p>
            <p>Broker Management</p>
            <p className='leading-none'>Transaction <br/>Management</p>
            <p className='leading-none'>Document<br/> Management</p>
            <p className='leading-none'>Property<br/> Management</p>



            {/*  <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`} >
                Property & Pricing
              </ListItem>
              <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Sales Management
              </ListItem>
            
              <ListItem className={` h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Broker Management
              </ListItem>
              <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Transaction Management
              </ListItem>
              <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Documents Management
              </ListItem>
              <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Property Management
              </ListItem> */}
          </div>
          
          



          {/*  <Accordion
            open={open === 1}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 1}>
              <AccordionHeader onClick={() => handleOpen(1)} className='h-5 mb-1 px-6 gap-2 text-neutral font-semibold hover:bg-accent hover:text-white'>
                <ListItemPrefix>
                  <PresentationChartBarIcon className="h-5 w-5" />
                </ListItemPrefix>
                <Typography className="mr-auto text-base font-semibold">
                  Transaction
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  Analytics
                </ListItem>
                <ListItem>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  Reporting
                </ListItem>
                <ListItem>
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  Projects
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion> */}
          {/*  <hr className="my-1 mx-3 border-1 border-blue-gray-100" />
  
          <ListItem className='h-4 mb-1 px-6 gap-2 text-neutral font-normal'>
           Settings
          </ListItem>
          <ListItem className='h-4 mb-1 px-6 gap-2 text-neutral font-normal'>
           FAQs
          </ListItem>
          <ListItem className='h-4 mb-1 px-6 gap-2 font-semibold'>
         
          </ListItem> */}
        </List>
      </Card>
    </>
  )
}

export default Sidebar