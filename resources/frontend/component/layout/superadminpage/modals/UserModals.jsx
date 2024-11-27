import React, { useRef, useState, useEffect } from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io'

const UserModals = ({ modalRef }) => {

    const dropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {

        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            console.log("clicked outside");
            /* setSelectedOptions((prevSelected) =>
                prevSelected.filter(
                    (item) => item.employee_email !== tempSelection.email
                )
            ); */
            setIsDropdownOpen(false);
        }
    };
    /*  const highlightText = (text) => {
         if (!text) return text;
         if (!search) return text;
 
         const parts = text.split(new RegExp(`(${search})`, "gi"));
 
         return (
             <span>
                 {parts.map((part, index) =>
                     part.toLowerCase() === search.toLowerCase() ? (
                         <span key={index} className="font-semibold">
                             {part}
                         </span>
                     ) : (
                         part
                     )
                 )}
             </span>
         );
     }; */



    return (
        <dialog
            id="Department"
            className="modal w-[683px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={modalRef}
        >
            <div className='relative p-[20px] mb-5 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="">
                        <button className="absolute top-3 right-3 w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className="flex justify-center items-center mt-[14px] ">
                    <AiFillInfoCircle className="size-[37px] text-[#5B9BD5]" />
                </div>
                <div className="mb-3 mt-[26px]">
                    <div className="relative w-[623px]" ref={dropdownRef}>
                        <div className="relative">
                            <input
                                type="text"
                                /*  value={search}
                                 onChange={(e) => setSearch(e.target.value)} */
                                placeholder="Search..."
                                className={` 
                                ${isDropdownOpen
                                        ? "rounded-[10px] rounded-b-none"
                                        : "rounded-[10px]"
                                    }
                        
                                 h-[48px] px-[20px] pr-[40px] rounded-[10px] bg-custom-grayF1 w-full outline-none`}
                                onFocus={() => setIsDropdownOpen(true)}
                            />

                        </div>

                        {/* Conditionally render the list when dropdown is open */}
                        {isDropdownOpen && (
                            <>
                                <div className="absolute w-[623px] min-h-[550px] space-y-2 border-t-0 border-gray-300 p-2 py-[20px] shadow-custom6 rounded-t-none rounded-[10px] bg-custom-grayF1 z-20">
                                    <ul className="flex flex-col space-y-2 max-h-[550px] overflow-auto">
                                        <li
                                            className="flex h-[110px] w-full py-[20px] px-[30px] gap-[18px] bg-custom-lightestgreen rounded-[10px] cursor-pointer"
                                        >
                                            <div>
                                                <span>
                                                    {/* {highlightText(
                                                                name
                                                            )} */}
                                                    name
                                                </span>
                                                <br />
                                                <span className="text-sm">
                                                    {/* {highlightText(
                                                                email
                                                            )} */}
                                                    email
                                                </span>
                                                <br />
                                                <span className="text-sm">
                                                    {/*  {highlightText(
                                                                department
                                                            )} */}
                                                    department
                                                </span>
                                            </div>
                                        </li>

                                        {/*  {filteredOptions.length == 0 && (
                                            <div>
                                                <p>No results found</p>
                                            </div>
                                        )} */}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='flex flex-col gap-[36px] mt-[26px]'>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>User</p>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Name
                            </span>
                            <input
                                name="name"
                                type="text"
                                /*   value={formData.lname}
                                  onChange={handleChange} */
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Department
                            </span>
                            <input
                                name="department"
                                type="text"
                                /*   value={formData.lname}
                                  onChange={handleChange} */
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Role
                            </span>
                            <input
                                name="role"
                                type="text"
                                /*   value={formData.lname}
                                  onChange={handleChange} */
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Permissions</p>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                                Notification
                            </span>
                            <div className="relative h-full w-full flex justify-center items-center">
                                <div className='w-[342px] h-[44px]'>
                                    <div className='w-full h-[44px] gap-[63px] flex items-center justify-center bg-white rounded-[5px]'>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                                Inquiry Management
                            </span>
                            <div className="relative h-full w-full flex justify-center items-center">
                                <div className='w-[342px] h-[44px]'>
                                    <div className='w-full h-[44px] gap-[63px] flex items-center justify-center bg-white rounded-[5px]'>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen h-[56px]`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[275px] h-full px-[15px]">
                                Transaction Management
                            </span>
                            <div className="relative h-full w-full flex justify-center items-center">
                                <div className='w-[342px] h-[44px]'>
                                    <div className='w-full h-[44px] gap-[63px] flex items-center justify-center bg-white rounded-[5px]'>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>R</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>W</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>E</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>D</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                        <div className='flex flex-col gap-[2.75px] items-center'>
                                            <p className='montserrat-semibold text-[10px] leading-[12.19px]'>S</p>
                                            <input type="checkbox" className='h-[16px] w-[16px]' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="">
                    <div className="flex justify-center mt-[26px] space-x-[19px]">
                        <button
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                        >
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>
                        <button
                            className="gradient-btn5 w-[100px] h-[35px] rounded-[10px] text-sm text-white montserrat-semibold"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}

export default UserModals