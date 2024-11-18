import React, { useEffect, useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { GoPlus } from "react-icons/go";
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
import { Link, useLocation } from "react-router-dom";
import apiService from "../../servicesApi/apiService";
import { useStateContext } from "../../../context/contextprovider";
import InquiryFormModal from "../inquirypage/InquiryFormModal";
import { set } from "lodash";
const Sidebar = () => {
  const { unreadCount, getCount } = useStateContext();
  const [activeItem, setActiveItem] = useState(null);
  const location = useLocation();
  const [isInquiryOpen, setInquiryOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [activeItemTransaction, setActiveItemTransaction] = useState(null);

  const handleDropdownClick = () => {
    setInquiryOpen(!isInquiryOpen);
  };

  const handleInvoiceDropdownClick = () => {
    setIsInvoiceOpen((prev) => !prev);
  };
  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const handleItemTransactionClick = (item) => {
    setActiveItemTransaction(item);
  };

  useEffect(() => {
    if (!location.pathname.startsWith("/inquirymanagement/thread")) {
      localStorage.removeItem("dataConcern");
      localStorage.removeItem("updatedData");
    }
  }, [location]);
  useEffect(() => {
    getCount();
  }, [location]);

  useEffect(() => {
    switch (location.pathname) {
      case "/transactionmanagement/invoices":
      case "/transactionmanagement/transactionrecords":
        setInquiryOpen(false);
        setIsInvoiceOpen(true);
        break;
      case "/inquirymanagement/inquirylist":
      case "/inquirymanagement/report":
      case "/inquirymanagement/autoassign":
        setIsInvoiceOpen(false);
        setInquiryOpen(true);
        break;
      default:
        setInquiryOpen(false);
        setIsInvoiceOpen(false);
        break;
    }
  }, [location.pathname]);

  return (
    <>
      <Card className="shadow-none w-[230px] max-w-[230px] p-[25px] pr-[20px] pt-0 rounded-none bg-custom-grayFA relative z-30">
        <List className="p-0 gap-0">
          <Link to="/notification">
            <ListItem
              className={`flex text-sm items-center w-[185px] h-[36px] pl-[12px] pr-[60px] gap-2 rounded-[10px] ${activeItem === "notification" &&
                location.pathname.startsWith("/notification")
                ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold"
                : " hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                } `}
              onClick={() => handleItemClick("notification")}
            >
              Notifications
              <ListItemSuffix>
                <Chip
                  value={unreadCount}
                  size="sm"
                  variant="ghost"
                  color="blue-gray"
                  className="rounded-md gradient-btn2 text-white"
                />
              </ListItemSuffix>
            </ListItem>
          </Link>
          <Link to="inquirymanagement/inquirylist">
            <ListItem
              className={`h-[35px] w-[185px] text-sm pl-[12px] transition-all duration-300 ease-in-out 
                  ${activeItem === "inquiry" ||
                  location.pathname.startsWith("/inquirymanagement")
                  ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold"
                  : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                }
                    ${isInquiryOpen
                  ? "rounded-[10px] rounded-b-none"
                  : "rounded-[10px]"
                }
                    `}
              onClick={handleDropdownClick}
            >
              Inquiry Management
              <ListItemSuffix>
                <IoIosArrowDown
                  className={`text-custom-solidgreen  transition-transform duration-200 ease-in-out ${isInquiryOpen ? "rotate-180" : ""
                    }`}
                />
              </ListItemSuffix>
            </ListItem>
          </Link>
          {isInquiryOpen &&
            location.pathname.startsWith("/inquirymanagement") && (
              <div className="px-[12px] py-[20px] w-[185px] min-h-[122px] flex flex-col gap-[5px] bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                <Link to="/inquirymanagement/inquirylist">
                  <ListItem
                    className={`h-[32px] w-full py-[8px] px-[18px]  text-sm rounded-[50px] ${location.pathname.startsWith(
                      "/inquirymanagement/inquirylist"
                    ) ||
                      location.pathname.startsWith(
                        "/inquirymanagement/thread"
                      )
                      ? "bg-white text-custom-solidgreen font-semibold"
                      : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }`}
                    onClick={() =>
                      handleItemClick(
                        "/inquirymanagement/inquirylist"
                      )
                    }
                  >
                    Inquiries
                  </ListItem>
                </Link>
                <Link to="/inquirymanagement/report">
                  <ListItem
                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                      "/inquirymanagement/report"
                    )
                      ? "bg-white text-custom-solidgreen font-semibold"
                      : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }`}
                    onClick={() =>
                      handleItemClick("/reports")
                    }
                  >
                    Reports
                  </ListItem>
                </Link>
                <Link to="/inquirymanagement/autoassign">
                  <ListItem
                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] hidden ${location.pathname.startsWith(
                      "/inquirymanagement/autoassign"
                    )
                      ? "bg-white text-custom-solidgreen font-semibold"
                      : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }`}
                    onClick={() =>
                      handleItemClick("/autoassign")
                    }
                  >
                    Auto Assign
                  </ListItem>
                </Link>
              </div>
            )}
          {/* <Link to="/transactionmanagement/invoices">
            <ListItem
              className={`h-[35px] w-[210px] text-sm pl-[12px] transition-all duration-300 ease-in-out 
            ${activeItemTransaction === "invoices" ||
                        location.pathname.startsWith("/transactionmanagement")
                        ? "bg-custom-lightestgreen text-custom-solidgreen font-semibold"
                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }
              ${isInvoiceOpen ? "rounded-[10px] rounded-b-none" : "rounded-[10px]"}
            `}
              onClick={handleInvoiceDropdownClick}
            >
              Transaction Management
              <ListItemSuffix>
                <IoIosArrowDown
                  className={`text-custom-solidgreen transition-transform duration-200 ease-in-out ${isInvoiceOpen ? "rotate-180" : ""
                    }`}
                />
              </ListItemSuffix>
            </ListItem>
          </Link> */}
          {/* 
          {isInvoiceOpen &&
            location.pathname.startsWith(
              "/transactionmanagement"
            ) && (
              <div className="px-[12px] py-[20px] w-[210px] min-h-[122px] flex flex-col gap-[5px] bg-custom-lightestgreen border-t rounded-t-none rounded-b-[10px] border-custom-solidgreen transition-all duration-300 ease-in-out">
                <Link to="/transactionmanagement/invoices">
                  <ListItem
                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                      "/transactionmanagement/invoices"
                    )
                        ? "bg-white text-custom-solidgreen font-semibold"
                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }`}
                    onClick={() =>
                      handleItemTransactionClick(
                        "/invoices"
                      )
                    }
                  >
                    Invoices
                  </ListItem>
                </Link>

                <Link to="/transactionmanagement/transactionrecords">
                  <ListItem
                    className={`h-[32px] w-full py-[8px] px-[18px] text-sm rounded-[50px] ${location.pathname.startsWith(
                      "/transactionmanagement/transactionrecords"
                    )
                        ? "bg-white text-custom-solidgreen font-semibold"
                        : "hover:font-bold hover:bg-gradient-to-r hover:from-custom-bluegreen hover:via-custom-lightgreen hover:to-custom-solidgreen hover:bg-clip-text hover:text-transparent text-custom-solidgreen "
                      }`}
                    onClick={() =>
                      handleItemTransactionClick(
                        "/transactionmanagement/transactionrecords"
                      )
                    }
                  >
                    Transaction Records
                  </ListItem>
                </Link>
              </div>
            )} */}

          <div className="mt-3 mb-1 px-4">
            <p className="text-[14px] font-bold bg-gradient-to-r from-custom-bluegreen via-custom-lightgreen to-custom-solidgreen bg-clip-text text-transparent">
              Coming Soon
            </p>
          </div>
          <div className=" text-sm p-4 h-auto rounded-[10px] text-gray-400 border border-custom-lightestgreen flex flex-col gap-4 cursor-not-allowed">
            <p>Property & Pricing</p>
            <p>Sales Management</p>
            <p>Broker Management</p>
            <p className='leading-none'>Transaction <br />Management</p>
            <p className="leading-none">
              Document
              <br /> Management
            </p>
            <p className="leading-none">
              Property
              <br /> Management
            </p>

            {/*  <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`} >
                Property & Pricing
              </ListItem>
              <ListItem className={`h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Sales Management
              </ListItem>
            
              <ListItem className={` h-7 mb-2 pl-5 gap-2 rounded-2xl text-custom-solidgreen hover:bg-custom-lightestgreen hover:font-semibold`}>
                Broker Management
              </ListItem>~
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
  );
};

export default Sidebar;
