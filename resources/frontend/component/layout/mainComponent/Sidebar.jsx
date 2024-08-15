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
import { Link } from 'react-router-dom';
const Sidebar = () => {
  return (
    <>
    <Card className=" w-full max-w-[15rem] p-4 pt-0 rounded-none bg-custombg">
        <List className='px-3 mt-4'>
          <ListItem className='h-7 mb-1 px-6 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold'>
            Notifications
            <ListItemSuffix>
              {/* <Chip value="120" size="sm" variant="ghost" color="blue-gray" className="rounded-md gradient-btn2 text-white" /> */}
            </ListItemSuffix>
          </ListItem>
          {/* <Link to='/dashboard' onClick={() => setActiveLink('/dashboard')}> */}
            <ListItem className={`h-7 mb-1 px-6 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`} >
            Property & Pricing
            </ListItem>
          {/* </Link> */}
         {/*  <Link to='/profile' onClick={() => setActiveLink('/profile')}> */}
            <ListItem className={`h-7 mb-1 px-2 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
            Sales Management
            </ListItem>
        {/*   </Link> */}
          <div className='flex items-center'>
          {/* <Link to='/myproperties' onClick={() => setActiveLink('/myproperties')}> */}
            <ListItem className={` h-7 mb-1 pl-6 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
              Broker Management
              </ListItem>
         {/*    </Link> */}
             {/*  <div className={`${activeLink === '/myproperties' ? 'triangle' : ''}`}></div> */}
          </div>
         {/*  <Link to='/documents' onClick={() => setActiveLink('/documents')}> */}
            <ListItem className={`h-7 mb-1 pl-3 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
            Inquiry Manangement
            </ListItem>
         {/*  </Link> */}
          <div className='flex items-center'>
           {/*  <Link to='/transaction' onClick={() => setActiveLink('/transaction')}> */}
              <ListItem className={`h-7 mb-1 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
              Transaction Management
              </ListItem>
          {/*   </Link> */}
           {/*  <div className={`${activeLink === '/transaction' ? 'triangle' : ''}`}></div> */}
          </div>
          <div className='flex items-center'>
            {/* <Link to='/raiseaconcern' onClick={() => setActiveLink('/raiseaconcern')}> */}
            <ListItem className={`h-7 mb-1 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Documents Management
            </ListItem>
          {/* </Link> */}
          </div>
          <div className='flex items-center'>
           {/*  <Link to='/transaction' onClick={() => setActiveLink('/transaction')}> */}
              <ListItem className={`h-7 mb-1 pl-1 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
              Property Management
              </ListItem>
          {/*   </Link> */}
           {/*  <div className={`${activeLink === '/transaction' ? 'triangle' : ''}`}></div> */}
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
          <hr className="my-1 mx-3 border-1 border-blue-gray-100" />
  
          <ListItem className='h-4 mb-1 px-6 gap-2 text-neutral font-normal'>
           Settings
          </ListItem>
          <ListItem className='h-4 mb-1 px-6 gap-2 text-neutral font-normal'>
           FAQs
          </ListItem>
          <ListItem className='h-4 mb-1 px-6 gap-2 font-semibold'>
           {/* <DashboardDom/> */}
          </ListItem>
        </List>
      </Card>
    </>
  )
}

export default Sidebar