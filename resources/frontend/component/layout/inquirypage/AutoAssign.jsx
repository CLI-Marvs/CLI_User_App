import React, { useState, useRef, useEffect } from 'react'
import DatePicker from 'react-datepicker';
import { IoIosArrowDown } from 'react-icons/io';
import DateLogo from "../../../../../public/Images/Date_range.svg";
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
import { TbTrashFilled } from 'react-icons/tb';
import { useStateContext } from '../../../context/contextprovider';
const AutoAssign = () => {

  const { propertyNamesList } = useStateContext();

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const filterBoxRef = useRef(null);


  const formatFunc = (name) => {
    return name
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };


  const formattedPropertyNames = [
    "N/A",
    ...(Array.isArray(propertyNamesList) && propertyNamesList.length > 0
      ? propertyNamesList
        .filter((item) => !item.toLowerCase().includes("phase"))
        .map((item) => {
          let formattedItem = formatFunc(item);

          // Capitalize each word in the string
          formattedItem = formattedItem
            .split(" ")
            .map((word) => {
              // Check for specific words that need to be fully capitalized
              if (/^(Sjmv|Lpu|Cdo|Dgt)$/i.test(word)) {
                return word.toUpperCase();
              }
              // Capitalize the first letter of all other words
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ");

          // Replace specific names if needed
          if (formattedItem === "Casamira South") {
            formattedItem = "Casa Mira South";
          }

          return formattedItem;
        })
        .sort((a, b) => {
          if (a === "N/A") return -1;
          if (b === "N/A") return 1;
          return a.localeCompare(b);
        })
      : []),
  ];

  const handleClickOutside = (event) => {
    if (
      filterBoxRef.current &&
      !filterBoxRef.current.contains(event.target)
    ) {
      setIsFilterVisible(false);
    }
  };

  const toggleFilterBox = () => {
    setIsFilterVisible((prev) => !prev);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsFilterVisible(false);
    }
  };

  useEffect(() => {
    if (isFilterVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterVisible]);


  return (
    <div className="h-screen max-w-full bg-custom-grayFA px-[20px]">
      <div className="bg-custom-grayFA">
        <div className="relative flex justify-start gap-3 pt-1">
          <div className="relative w-[604px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4 absolute left-3 top-4 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              readOnly={true}
              onClick={toggleFilterBox}
              className="h-[47px] w-[606px] bg-custom-grayF1 rounded-[10px] pl-9 pr-6 text-sm"
              placeholder="Search"
            />
            <svg
              onClick={toggleFilterBox}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-[24px] absolute right-3 top-3 text-custom-bluegreen hover:bg-gray-200 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
              />
            </svg>
          </div>
          {/* <div className="flex items-center">
            <button
              onClick={handleOpenModal}
              className="h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]"
            >
              {" "}
              <span className="text-[18px]">+</span> Add
              Inquiry
            </button>
          </div> */}

          {isFilterVisible && (
            <div
              ref={filterBoxRef}
              className="absolute left-0 mt-12 p-8 bg-white border border-gray-300 shadow-lg rounded-lg z-10 w-[604px]"
            >
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Name
                  </label>
                  <input
                    type="text"
                    /*  value={name}
                     onChange={(e) =>
                       setName(e.target.value)
                     } */
                    className="w-full  border-b-1 outline-none text-sm px-[8px]"
                  />
                </div>
                <div className="flex relative">
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Category
                  </label>
                  {/* 
                                        <select
                                            className="w-full border-b-1 outline-none appearance-none text-sm   "
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                        >
                                            <option value=" ">
                                                 Select Category
                                            </option>
                                            <option
                                                value="Reservation Documents"
                                                className="bg-red-900"
                                            >
                                                &nbsp;&nbsp;Reservation
                                                Documents
                                            </option>
                                            <option value="Payment Issues">
                                                Payment Issues
                                            </option>
                                            <option value="SOA/ Billing Statement/ Buyer's Ledger">
                                                SOA/ Billing Statement/ Buyer's
                                                Ledger
                                            </option>
                                            <option value="Turn Over Status">
                                                Turn Over Status
                                            </option>
                                            <option value="Unit Status">
                                                Unit Status
                                            </option>
                                            <option value="Loan Application">
                                                Loan Application
                                            </option>
                                            <option value="Title and Other Registration Documents">
                                                Title and Other Registration
                                                Documents
                                            </option>
                                            <option value="Commissions">
                                                Commissions
                                            </option>
                                            <option value="Other Concerns">
                                                Other Concerns
                                            </option>
                                        </select> */}
                  <div className="flex bg-red-900 justify-start w-full relative">
                    <label
                      htmlFor=""
                      className="w-full border-b-2"
                    >
                      {""}
                    </label>
                    <select
                      className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                    /*  value={category}
                     onChange={(e) =>
                       setCategory(e.target.value)
                     } */
                    >
                      <option value=" ">
                        Select Category
                      </option>
                      <option value="Reservation Documents">
                        Reservation Documents
                      </option>
                      <option value="Payment Issues">
                        Payment Issues
                      </option>
                      <option value="SOA/ Buyer's Ledger">
                        SOA/
                        Buyer's Ledger
                      </option>
                      <option value="Turn Over Status">
                        Turn Over Status
                      </option>
                      <option value="Unit Status">
                        Unit Status
                      </option>
                      <option value="Loan Application">
                        Loan Application
                      </option>
                      <option value="Title and Other Registration Documents">
                        Title and Other Registration
                        Documents
                      </option>
                      <option value="Commissions">
                        Commissions
                      </option>
                      <option value="Other Concerns">
                        Other Concerns
                      </option>
                    </select>
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                    <IoIosArrowDown />
                  </span>
                </div>
                <div className="flex relative">
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Status
                  </label>
                  <div className="flex bg-red-900 justify-start w-full relative">
                    <label
                      htmlFor=""
                      className="w-full border-b-2"
                    >
                      {""}
                    </label>
                    <select
                      className="w-full border-b-1 outline-none appearance-none text-sm absolute px-[8px]"
                    /*  value={status}
                     onChange={(e) =>
                       setStatus(e.target.value)
                     } */
                    >
                      <option value=" ">
                        Select Status
                      </option>
                      <option value="Resolved">
                        Resolved
                      </option>
                      <option value="Unresolved">
                        Unresolved
                      </option>
                    </select>
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                    <IoIosArrowDown />
                  </span>
                </div>
                <div className="flex">
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Email
                  </label>
                  <input
                    type="text"
                    /* value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    } */
                    className="w-full  border-b-1 outline-none text-sm px-[8px]"
                  />
                </div>
                <div className="flex">
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Ticket
                  </label>
                  <input
                    type="text"
                    /* value={ticket}
                    onChange={(e) =>
                      setTicket(e.target.value)
                    } */
                    className="w-full  border-b-1 outline-none text-sm px-[8px]"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex">
                    <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[94px]">
                      Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        /* selected={startDate}
                        onChange={handleDateChange} */
                        className="border-b-1 outline-none w-[146px] text-sm px-[8px]"
                        calendarClassName="custom-calendar"
                      />

                      <img
                        src={DateLogo}
                        alt="date"
                        className="absolute top-[45%] right-0 transform -translate-y-1/2 text-custom-bluegreen size-6 cursor-pointer pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="flex relative">
                    <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[65px]">
                      {" "}
                      Property
                    </label>
                    <select
                      className="w-[220px] border-b-1 outline-none appearance-none text-sm px-[8px]"
                    /*  onChange={handleSelectProperty}
                     value={selectedProperty} */
                    >
                      <option value="">
                        Select Property
                      </option>
                      {/*  {formattedPropertyNames.map(
                        (item, index) => {
                          return (
                            <option
                              key={index}
                              value={item}
                            >
                              {item}
                            </option>
                          );
                        }
                      )} */}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center  pl-3 pointer-events-none">
                      <IoIosArrowDown />
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex gap-5">
                  <input
                    type="checkbox"
                  /* checked={hasAttachments}
                  onChange={handleCheckboxChange} */
                  />
                  <label className="flex justify-start items-end text-custom-bluegreen text-[12px] w-[114px]">
                    {" "}
                    Has Attachments
                  </label>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    className="h-[37px] w-[88px] gradient-btn rounded-[10px] text-white text-sm"
                  /*  onClick={handleSearch} */
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/*  <div className="flex items-center">
            <button onClick={handleOpenModal} className='h-[38px] w-[121px] gradient-btn5 text-white  text-xs rounded-[10px]'> <span className='text-[18px]'>+</span> Add Inquiry</button>
        </div> */}
      </div>
      <div className='w-full mt-[12px]'>
        <div className='flex '>
          <table>
            <thead>
              <tr className='h-[49px] flex items-center gap-[76px] text-custom-gray81 bg-white montserrat-semibold text-sm'>
                <th className='rounded-tl-[10px] pl-[16px] w-[150px] text-left'>Property</th>
                <th className='w-[150px] text-left'>Category</th>
                <th className='w-[150px] text-left'>Auto Assign To</th>
                <th className='w-[150px] text-left'>Set by</th>
                <th className='rounded-tr-[10px] text-left w-[184px]'>Action</th>
              </tr>
            </thead>
            <tbody className='flex flex-col'>
              <tr className='h-[46px] flex items-center gap-[76px] mt-[10px] text-sm bg-custom-lightestgreen'>
                <td className='pl-[16px] w-[150px]'>
                  <select name="property" id="" className='w-[150px] h-[31px] rounded-[5px] pl-[15px] text-sm'>
                    <option value="">(Select)</option>
                    {formattedPropertyNames.map(
                        (item, index) => {
                            return (
                                <option
                                    key={index}
                                    value={item}
                                >
                                    {item}
                                </option>
                            );
                        }
                    )}
                  </select>
                </td>
                <td className='w-[150px]'>
                  <select name="category" id="" className='w-[150px] h-[31px] rounded-[5px] pl-[15px] text-sm'>
                    <option value="">(Select)</option>
                    <option value="Reservation Documents">
                        Reservation Documents
                      </option>
                      <option value="Payment Issues">
                        Payment Issues
                      </option>
                      <option value="SOA/ Buyer's Ledger">
                        SOA/
                        Buyer's Ledger
                      </option>
                      <option value="Turn Over Status">
                        Turn Over Status
                      </option>
                      <option value="Unit Status">
                        Unit Status
                      </option>
                      <option value="Loan Application">
                        Loan Application
                      </option>
                      <option value="Title and Other Registration Documents">
                        Title and Other Registration
                        Documents
                      </option>
                      <option value="Commissions">
                        Commissions
                      </option>
                      <option value="Other Concerns">
                        Other Concerns
                      </option>
                  </select>
                </td>
                <td className='w-[150px]'>
                  <select name="assignto" id="" className='w-[150px] h-[31px] rounded-[5px] pl-[15px] text-sm'>
                    <option value="">(Select)</option>
                  </select>
                </td>
                <td className='w-[150px]'>
                  <input type="text" className='w-[150px] h-[31px] rounded-[5px] pl-[15px] text-sm outline-none' value={"janet doe"} />
                </td>
                <td className='w-[175px] flex gap-[10px]'>
                  <button className='flex justify-center items-center gap-1 h-[31px] w-full gradient-btn5 rounded-[10px] text-white text-sm'>
                    <span className='text-xl'><IoMdAdd /></span> Add
                  </button>

                  {/* add and edit button */}

                  {/* <button className='flex justify-center items-center gap-1 h-[31px] w-full gradient-btn5 p-[1px] rounded-[10px] text-white text-sm'>
                     <div className='flex justify-center items-center w-full h-full rounded-[9px] bg-white'>
                        <p className='montserrat-medium text-sm bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-lightgreen bg-clip-text text-transparent'>
                          Edit
                        </p>
                     </div>
                  </button> */}

                  <div className='flex justify-center items-center text-red-500 hover:text-red-600 cursor-pointer text-xl'>
                    <TbTrashFilled />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='w-[1122px] h-auto mt-[10px] flex justify-center'>
          <button className='h-[51px] w-[52px] flex justify-center items-center gradient-btn rounded-full text-white text-sm'>
            <IoMdAdd className='text-[30px]' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AutoAssign