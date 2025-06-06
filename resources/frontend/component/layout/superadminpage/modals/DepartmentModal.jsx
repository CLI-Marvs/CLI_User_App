import React from 'react'
import { AiFillInfoCircle } from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io'

const DepartmentModal = ({ modalRef }) => {
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
                <div className='flex flex-col gap-[36px] mt-[26px]'>
                    <div className='w-full p-[10px] flex flex-col gap-[10px]'>
                        <p className='text-sm font-semibold'>Department</p>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Department
                            </span>
                            <div className="relative w-full">
                                <select
                                    /* value={formData.channels}
                                    onChange={handleChange} */
                                    name="department"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="CRS">CRS</option>
                                    <option value="Treasury">Treasury</option>
                                    <option value="Accounting">Accounting</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Role
                            </span>
                            <div className="relative w-full">
                                <select
                                    /* value={formData.channels}
                                    onChange={handleChange} */
                                    name="department"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value="">(Select)</option>
                                    <option value="CRS">Role I</option>
                                    <option value="Treasury">Role II</option>
                                    <option value="Accounting">Role III</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
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

export default DepartmentModal