import React from 'react'

const InquiryFormModal = ({modalRef}) => {
    return (
        <dialog id="Employment" className="modal w-2/5 rounded-lg" ref={modalRef}>
            <div className=' px-20 rounded-lg'>
                <div className=''>
                    <form method="dialog" className="pt-3 flex justify-end -mr-20">
                        <button className="flex justify-center w-10 h-10 items-center rounded-full bg-custombg3 text-custom-bluegreen hover:bg-custombg">
                            ✕
                        </button>
                    </form>
                </div>
                <div className='pt-5 flex justify-start items-center mb-5'>
                    <p className='montserrat-bold'>Inquiry Form</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex w-3/4 pl-3 py-1">Name</span>
                        <input name='name' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex w-3/4 pl-3 py-1">Contact Number</span>
                        <input name='contact' type="text" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex w-3/4 pl-3 py-1">Email</span>
                        <input name='email' type="email" className="w-full px-4 focus:outline-none" placeholder="" />
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-3/4 -mr-3 pl-3 py-1">Concern</span>
                        <div className="relative w-full">
                            <select name="concern" className="appearance-none w-full px-4 py-1 bg-white text-gray-400 focus:outline-none border-0">
                                <option value="">Select Concern</option>
                                <option value="concern1">Concern 1</option>
                                <option value="concern2">Concern 2</option>
                                <option value="concern3">Concern 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-custom-gray81" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="text-custom-gray81 bg-custombg flex items-center w-3/4 -mr-3 pl-3 py-1">Property</span>
                        <div className="relative w-full">
                            <select name="property" className="appearance-none w-full px-4 py-1 bg-white text-gray-400 focus:outline-none border-0">
                                <option value="">Select Property</option>
                                <option value="property1">Property 1</option>
                                <option value="property2">Property 2</option>
                                <option value="property3">Property 3</option>
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custombg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-custom-gray81" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
                <div className='border border-b-1 border-gray-300 my-2'></div>
                <div className=' bg-custombg border'>
                    <div className='flex items-center justify-between'>
                        <p className='text-custom-gray81 pl-3 text-sm montserrat-semibold flex-grow'>Details</p>
                        <span className='bg-white text-sm2 text-gray-400 font-normal py-3 border pl-2 pr-12 ml-auto'>0/1000 characters</span>
                    </div>
                    <div className='flex gap-3'>
                        <textarea id="message" rows="4" className="block border-t-1 h-40 p-2.5 w-full text-sm text-gray-900 bg-white"></textarea>
                    </div> 
                </div>
                <div className="mt-5 mb-12">
                    <form method="dialog" className='flex justify-between'>
                        <label
                            htmlFor="changeprofile"
                            className="h-10 px-3 text-sm-xlight border montserrat-medium border-custom-solidgreen rounded-lg text-custom-solidgreen flex justify-center items-center gap-1 cursor-pointer hover:shadow-custom"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-3"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                                />
                            </svg>
                            Attachments
                            <input
                                type="file"
                                id="changeprofile"
                                className="hidden"
                            // Optionally, you can add an `onChange` event handler here
                            />
                        </label>
                        <button className='h-10 text-white px-10 rounded-lg gradient-btn2'>
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default InquiryFormModal