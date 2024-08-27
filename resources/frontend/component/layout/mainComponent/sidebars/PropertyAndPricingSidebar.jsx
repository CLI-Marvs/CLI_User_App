import React, {useRef} from 'react'
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

const PropertyAndPricingSidebar = () => {

    const location = useLocation();

  return (
    <>
        <Card className='flex w-[230px] h-screen pt-3 rounded-none bg-customnavbar'>
            <List className='flex flex-col justify-center w-full'>
                <div className='px-5 leading-1'>
                    <div className='flex flex-col space-y-1 mt-1'>
                        <Link to="pricingmasterlist">
                            <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full text-custom-solidgreen font-normal hover:font-semibold hover:bg-white ${location.pathname === '/propertyandpricing/pricingmasterlist' ? 'text-custom-solidgreen font-semibold bg-white' : 'text-custom-solidgreen'}`}>
                                Pricing Master List
                            </ListItem>
                        </Link>
                        <Link to="basicpricing">
                            <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${location.pathname === '/propertyandpricing/basicpricing' ? 'text-custom-solidgreen font-semibold bg-white' : 'text-custom-solidgreen'}`}>
                                Basic Pricing
                            </ListItem>
                        </Link>
                        <Link to="paymentscheme">
                            <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${location.pathname === '/propertyandpricing/paymentscheme' ? 'text-custom-solidgreen font-semibold bg-white' : 'text-custom-solidgreen'}`}>
                                Payment Scheme
                            </ListItem>
                        </Link>
                        <Link to="priceversioning">
                            <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${location.pathname === '/propertyandpricing/priceversioning' ? 'text-custom-solidgreen font-semibold bg-white' : 'text-custom-solidgreen'}`}>
                                Price Versioning
                            </ListItem>
                        </Link>
                        <Link to="promotionalpricing">
                            <ListItem className={`menu2 text-sm h-7 mb-1 flex justify-start pl-4 gap-2 rounded-full font-normal hover:font-semibold hover:bg-white ${location.pathname === '/propertyandpricing/promotionalpricing' ? 'text-custom-solidgreen font-semibold bg-white' : 'text-custom-solidgreen'}`}>
                                Promotional Pricing
                            </ListItem>
                        </Link>
                       
                    </div>
                </div>
            </List>
        </Card>
        
    </>
  )
}

export default PropertyAndPricingSidebar