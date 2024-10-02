import React, { useState } from 'react'

const AddSourceFundsModal = ({ modalRef }) => {

    const [regionType, setRegionType] = useState('Local');

    const handleRegionChange = (event) => {
        setRegionType(event.target.value);
    };
    return (
        <dialog className="modal rounded-[20px] backdrop:bg-black/50" ref={modalRef}>
            <div className=' w-[900px] p-[60px] bg-white relative'>
                <div className='flex flex-col '>
                    <div className='flex  justify-center items-center w-full h-10 bg-custom-grayFA text-custom-bluegreen montserrat-semibold rounded-lg'>
                        Employment
                    </div>
                    <form method="dialog" className='absolute top-2 right-3'>
                        <button className=" flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg">✕</button>  
                    </form>
                    <div className='grid grid-cols-3 gap-x-3 p-5 bg-custom-grayFA rounded-xl mt-3'>
                        <div className='relative gap-5 col-span-3 flex mb-4'>
                            <span className='flex gap-2 '><input type="radio" name='region_type' checked={regionType === 'Local'} onChange={handleRegionChange} value="Local" className='cursor-pointer accent-custom-bluegreen' /><label className='text-sm text-custom-bluegreen'>Local</label></span>
                            <span className='flex gap-2 '><input type="radio" name='region_type' checked={regionType === 'OFW'} onChange={handleRegionChange} value="OFW" className='cursor-pointer accent-custom-bluegreen' /><label className='text-sm text-custom-bluegreen'>Overseas (OFW)</label></span>
                        </div>
                        {regionType === 'Local' ? (
                            <>
                                <div className="relative mb-[15px] col-span-2 text-custom-bluegreen font-semibold">
                                    <input type="text" id="comname" name="company_name" placeholder=" " className="input-floating-label w-full  rounded-[5px]" />
                                    <label htmlFor="comname" className="label-floating text-xs">Name of Company</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <input type="text" id="empContact" name="contact_no" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empContact" className="label-floating text-xs">Contact No.</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <input type="text" id="jobTitle" name="job_title" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="jobTitle" className="label-floating text-xs">Job Title</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <select className=' h-12 w-full px-1 flex items-center montserrat-medium rounded-[5px] text-custom-bluegreen text-xs'
                                        name="monthlySalary" defaultValue="monthly Salary 1" id="monthlySalary">
                                        <option value="monthly salary 1" selected >monthly salary</option>
                                    </select>
                                </div>
                                <div className='relative my-[15px] col-span-3'>
                                    <p className='text-sm montserrat-semibold text-custom-bluegreen'>Employer Address</p>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold mb-[15px]">
                                    <input type="text" id="empUnit" name="unit_number" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empUnit" className="label-floating text-xs">Unit/Floor/Block Number</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empBldg" name="building_name" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empBldg" className="label-floating text-xs">Building Name</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empStreet" name="street_name" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empStreet" className="label-floating text-xs">Street Name</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empStreet" name="barangay" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empStreet" className="label-floating text-xs">Barangay</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empCity" name="city" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empCity" className="label-floating text-xs">City/Municipality</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold mb-3">
                                    <input type="text" id="empProvince" name="province" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empProvince" className="label-floating text-xs">Province</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empZip" name="zipcode" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empZip" className="label-floating text-xs">Zip Code</label>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative mb-[15px] text-custom-bluegreen font-semibold">
                                    <input type="text" id="comname" name="company_name" placeholder=" " className="input-floating-label w-full  rounded-[5px]" />
                                    <label htmlFor="comname" className="label-floating text-xs">Name of Company</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <select className=' h-12 w-full px-1 flex items-center montserrat-medium rounded-[5px] text-custom-bluegreen text-xs'
                                        name="location" defaultValue="location 1" id="monthlySalary">
                                        <option value="location 1" selected >location 1</option>
                                    </select>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <input type="text" id="empContact" name="contact_no" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empContact" className="label-floating text-xs">Contact No.</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <input type="text" id="jobTitle" name="job_title" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="jobTitle" className="label-floating text-xs">Job Title</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold">
                                    <select className=' h-12 w-full px-1 flex items-center montserrat-medium rounded-[5px] text-custom-bluegreen text-xs'
                                        name="monthlySalary" defaultValue="monthly Salary 1" id="monthlySalary">
                                        <option value="monthly salary 1" selected >monthly salary</option>
                                    </select>
                                </div>
                                <div className='relative my-[15px] col-span-3'>
                                    <p className='text-sm montserrat-semibold text-custom-bluegreen'>Employer Address</p>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold mb-[15px]">
                                    <input type="text" id="empUnit" name="unit_number" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empUnit" className="label-floating text-xs">Unit/Floor/Block Number</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empBldg" name="building_name" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empBldg" className="label-floating text-xs">Building Name</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empStreet" name="street_name" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empStreet" className="label-floating text-xs">Street Name</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empStreet" name="barangay" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empStreet" className="label-floating text-xs">Barangay</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empCity" name="city" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empCity" className="label-floating text-xs">City/Municipality</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold mb-3">
                                    <input type="text" id="empProvince" name="province" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empProvince" className="label-floating text-xs">Province</label>
                                </div>
                                <div className="relative col-span-1 text-custom-bluegreen font-semibold ">
                                    <input type="text" id="empZip" name="zipcode" placeholder=" " className="input-floating-label w-full rounded-[5px]" />
                                    <label htmlFor="empZip" className="label-floating text-xs">Zip Code</label>
                                </div>
                            </>
                        )}

                    </div>
                </div>
                <form method="dialog" className=''>
                    <div className='w-full mt-[30px] flex justify-end '>
                        <button className='h-[50px] w-[64px] rounded-[10px] bg-custom-solidgreen montserrat-semibold text-white' >Add</button>
                    </div>
                </form>

            </div>
        </dialog>
    )
}

export default AddSourceFundsModal