import React from 'react'
import { IoIosSend, IoMdArrowDropdown } from 'react-icons/io';

const ThreadInquiryFormModal = ({ modalRef, dataConcern, filesRef }) => {
    console.log("dataConcern from modal", dataConcern);
    console.log("attachment", filesRef);
  return (
    <dialog
            id="Employment"
            className="modal w-[589px] rounded-[10px] shadow-custom5 backdrop:bg-black/50"
            ref={modalRef}
        >
           
            <div className=" px-20 rounded-lg">
                <div className="">
                    <form
                        method="dialog"
                        className="pt-1 flex justify-end -mr-[75px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg"
                        >
                            ✕
                        </button>
                    </form>
                    <div>
                        <div className="flex justify-center items-center my-2 mobile:mb-7 mobile:my-0">
                            <p className="montserrat-bold text-[19px] text-custom-solidgreen mobile:text-sm">
                                Feedback / Inquiry Form
                            </p>
                        </div>
                       

                        {/* {specificInputErrors &&
                            Object.entries(specificInputErrors).map(
                                (item, index) => (
                                    <div
                                        className="w-full flex justify-center items-center h-12 bg-red-100 mb-4 rounded-lg"
                                        key={index}
                                    >
                                        <p className="flex text-[#C42E2E] ">
                                            {item}
                                        </p>
                                    </div>
                                )
                            )} */}
                        {/*  {isSuccess && (
                                <div className="w-full flex justify-center items-center h-12 bg-custom-lightestgreen mb-4 rounded-lg">
                                    <p className="flex text-custom-solidgreen ">
                                       Message sent successfully.
                                    </p>
                                </div>
                            )} */}  
                    </div>
                    <div className="mb-3">
                        <p className="text-sm font-semibold mobile:text-xs">
                            Required
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex pl-3 py-1 w-[240px]">
                                First Name
                            </span>
                            <input
                                name="fname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataConcern.buyer_firstname || ""}
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden border-custom-bluegreen`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Middle Name
                                </span>
                                <input
                                    name="mname"
                                    type="text"
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    value={dataConcern.buyer_middlename || ""}

                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        type="checkbox"
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value={dataConcern.buyer_middlename || ""}
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>

                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Last Name
                            </span>
                            <input
                                name="lname"
                                type="text"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataConcern.buyer_lastname || ""}
                            />
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <div
                                className={`flex relative items-center border w-[430px] rounded-[5px] overflow-hidden border-custom-bluegreen`}
                            >
                                <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1 tablet:w-[160px] mobile:w-[270px] mobile:text-xs">
                                    Suffix Name
                                </span>
                                <input
                                    name="suffix"
                                    type="text"  
                                    className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                    placeholder=""
                                     value={dataConcern.suffix_name || ""}

                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 gap-2 text-sm bg-custom-lightestgreen">
                                    <input
                                        type="checkbox"
                                        name="checkbox"
                                        className="accent-custom-lightgreen"
                                        value="checkbox"
                                    />
                                    <p>N/A</p>
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border  rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Email
                            </span>
                            <input
                                name="buyer_email"
                                type="email"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataConcern.buyer_email || ""}

                            />
                        </div>
                        
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Mobile Number
                            </span>
                            <input
                                name="mobile_number"
                                type="number"
                                onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                                }
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataConcern.mobile_number || ""}

                            />
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Property
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="property"
                                    className="appearance-none w-full px-4 text-sm py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value={dataConcern.property || ""}>{dataConcern.proerty || ""}</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex  items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Concern regarding
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="details_concern"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value={dataConcern.details_concern || ""}>{dataConcern.details_concern || ""}</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Type
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="type"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value={dataConcern.communication_type || ""}>{dataConcern.communication_type || ""}</option>
                        
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex items-center border rounded-[5px] overflow-hidden border-custom-bluegreen`}
                        >
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[250px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-3 pl-3 py-1">
                                Channels
                            </span>
                            <div className="relative w-full">
                                <select
                                   
                                    name="channels"
                                    className="appearance-none text-sm w-full px-4 py-1 bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value={dataConcern.channels || ""}>{dataConcern.channels || ""}</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        <div className="border border-t-1 border-[#D9D9D9]"></div>
                        <div className="mt-3">
                            <p className="text-sm font-semibold mobile:text-xs">
                                Optional
                            </p>
                        </div>
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex items-center w-[255px] tablet:w-[175px] mobile:w-[270px] mobile:text-xs -mr-4 pl-3 py-1">
                                Inquiry From
                            </span>
                            <div className="relative w-full">
                                <select
                                    name="user_type"
                                    className="appearance-none w-full px-4 py-1 text-sm bg-white focus:outline-none border-0 mobile:text-xs"
                                >
                                    <option value={dataConcern.user_type|| ""}>{dataConcern.user_type || ""}</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3  bg-custom-lightestgreen text-custom-bluegreen pointer-events-none">
                                    <IoMdArrowDropdown />
                                </span>
                            </div>
                        </div>
                        {/* {formData.user_type === "Others" && (
                            <div className="flex justify-end">
                                <div
                                    className={`flex items-center border rounded-[5px] w-[277px] overflow-hidden ${isSubmitted && !formData.other_user_type
                                        ? resetSuccess
                                            ? "border-custom-bluegreen"
                                            : "border-red-500"
                                        : "border-custom-bluegreen"
                                        }`}
                                >
                                    <input
                                        name="other_user_type"
                                        type="text"
                                        className="w-full px-4 text-sm focus:outline-none mobile:text-xs py-1"
                                        value={formData.other_user_type}
                                        onChange={handleChange}
                                        placeholder=""
                                    />
                                </div>
                            </div>
                        )} */}
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Contract Number
                            </span>
                            <input
                                name="contract_number"
                                type="number"
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                                value={dataConcern.contract_number || ""}
                                onInput={(e) =>
                                (e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                ))
                                }
                            />
                        </div>
                        <div className="flex items-center border border-custom-bluegreen rounded-[5px] overflow-hidden">
                            <span className="text-custom-bluegreen text-sm bg-custom-lightestgreen flex w-[240px] pl-3 py-1">
                                Unit/Lot Number
                            </span>
                            <input
                                name="unit_number"
                                type="text"
                                value={dataConcern.unit_number || ""}
                                className="w-full px-4 text-sm focus:outline-none mobile:text-xs"
                                placeholder=""
                            />
                        </div>
                    </div>
                    <div className="border border-b-1 border-[#D9D9D9] my-2"></div>
                    <div
                        className={`border-custom-bluegreen rounded-[5px] bg-custom-lightestgreen border`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-custom-bluegreen text-sm bg-custom-lightestgreen pl-3  montserrat-semibold flex-grow mobile:text-xs mobile:w-[170px]">
                                Details (Required)
                            </p>
                            <span className="bg-white text-sm2 text-gray-400 font-normal py-3 border-l border-custom-bluegreen pl-2 pr-12 mobile:pr-1 mobile:text-xs ml-auto rounded-tr-[4px]">
                                {" "}
                                {/* {message.length} */}0/500 characters
                            </span>
                        </div>
                        <div className="flex gap-3 ">
                            <textarea
                                id="details_message"
                                value={dataConcern.details_message || ""}
                                name="details_message"
                                placeholder=""
                                rows="4"
                                className={` border-custom-bluegreen rounded-b-[5px] border-t w-full pl-2 outline-none`}
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex flex-col mt-5 mb-12">
                        <div className="flex justify-between w-54 tablet:flex-col">
                         {/*    <div>{filesRef && filesRef.attachment.map((item) => {
                                return (
                                    <div>
                                        <span>{item.original_file_name}</span>
                                    </div>
                                )
                            })}</div> */}
                            <button
                              /*   onClick={handleSubmit}
                                disabled={loading} */
                                type="submit"
                                className={`w-[133px] text-sm montserrat-semibold text-white h-[40px] rounded-[10px] gradient-btn2 flex justify-center items-center gap-2 tablet:w-full hover:shadow-custom4

                                            `}
                            >
                                
                                        Submit
                                        <IoIosSend />
                                   
                            </button>
                        </div>
                        {/* <div className="mt-2">
                            {fileName && fileName.length > 0
                                ? fileName.map((item, index) => {
                                    return (
                                        <p
                                            key={index}
                                            className="flex items-center text-sm text-red-900 truncate gap-1"
                                        >
                                            {item}{" "}
                                            <IoMdTrash
                                                className="hover:text-red-500"
                                                onClick={() =>
                                                    handleDelete(item)
                                                }
                                            />
                                        </p>
                                    );
                                })
                                : null}
                        </div> */}
                    </div>
                </div>
            </div>
        </dialog>
  )
}

export default ThreadInquiryFormModal