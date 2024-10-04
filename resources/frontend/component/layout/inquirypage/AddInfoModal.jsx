import React, { useState } from 'react'
import { IoMdArrowDropdown } from 'react-icons/io'

const AddInfoModal = ({ modalRef }) => {

    const [message, setMessage] = useState("");

    const maxCharacters = 500;

    const handleChangeValue = (e) => {
        const newValue = e.target.value;
        setMessage(newValue);

    };
    return (
        <dialog id="Resolved" className="modal w-[587px] rounded-[10px] shadow-custom5 backdrop:bg-black/50" ref={modalRef}>
            <div className=" rounded-[10px]">
                <div className="absolute right-0">
                    <form
                        method="dialog"
                        className="pt-3 flex justify-end mr-2"
                    >
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custom-grayFA text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className=' px-[50px] py-[77px] flex flex-col gap-[40px]'>
                    <div className='flex flex-col gap-[10px]'>
                        <div className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`} >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                First Name
                            </span>
                            <input
                                name="fname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`} >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Email
                            </span>
                            <input
                                name="email"
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`} >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Mobile Phone No.
                            </span>
                            <input
                                name="mobilnum"
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-[10px]'>
                        <div className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`} >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Contract No.
                            </span>
                            <input
                                name="contractNo"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                        <div
                            className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`}>
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex items-center w-[300px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    /*     value={formData.property}
                                        onChange={handleChange} */
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">property</option>
                                    <option value="property1">Property1</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex  items-center pr-3 pl-3 bg-[#EDEDED] text-custom-gray81 pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className={`flex items-center border border-[D6D6D6] rounded-[5px] overflow-hidden`} >
                            <span className="text-custom-gray81 text-sm bg-[#EDEDED] flex pl-3 py-1 w-[300px]">
                                Unit/Lot
                            </span>
                            <input
                                name="mobilnum"
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs no-spinner"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div
                        className={`border-[D6D6D6] rounded-[5px] bg-[#EDEDED] border`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-gray81 text-sm bg-[#EDEDED] pl-3 flex-grow mobile:text-xs mobile:w-[170px]">
                                Notes/Remarks
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border border-[D6D6D6] pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-r-[4px]">
                                {" "}
                                {message.length}/500 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                value={message}
                                onChange={handleChangeValue}
                                maxLength={maxCharacters}
                                name="details_message"
                                placeholder="Write your concern here."
                                rows="4"
                                draggable="false"
                                className={` rounded-[5px] bg-white border border-[D6D6D6] w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className='flex justify-end'>
                        <form  method="dialog">
                            <button className='w-[133px] h-[39px] gradient-btn5 font-semibold text-sm text-white rounded-[10px]'>
                                    Submit
                            </button>
                        </form>
                       
                    </div>
                </div>
            </div>

        </dialog>
    )
}

export default AddInfoModal