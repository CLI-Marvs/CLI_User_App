import React from 'react'
import UnitCards from './UnitCards';

const UnitDetails = () => {
    return (
        <div className="flex justify-center items-center mt-[50px]">
            <div className="w-full h-[1000px] px-[86px] py-[60px] bg-white rounded-[25px]">
                <div className="flex justify-start items-center">
                    <div className="flex-col ">
                        <div className="flex items-center">
                            <h1 className="text-[50px] text-custom-lightgreen montserrat-regular">
                                38 park avenue
                            </h1>
                            <div className='h-[61px] border-l-[4px] mx-[19px] border-custom-solidgreen'></div>
                            <div className=" flex items-center justify-center h-[40px] w-[177px] rounded-[20px] bg-custom-solidgreen">
                                <p className="text-white montserrat-regular text-[24px]">20 Units Left</p>
                            </div>
                        </div>
                        <div className="text-lg px-1 flex justify-start items-start">
                            <p className="montserrat-regular">Find Your Specific Unit</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-start space-x-[13px] mt-[61px] ">
                    {/* {projectType && projectType === "vertical" ? (
                        <>
                            <div>
                                <label
                                    htmlFor="property"
                                    className="block mb-2 text-sm montserrat-bold text-gray-900 dark:text-white "
                                >
                                    Building / Tower
                                </label>
                                <select
                                    id="property"
                                    className=" bg-gray-200 border border-black text-gray-600 font-medium text-xs rounded-lg
             focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600
              dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option selected disabled>
                                        Please Select
                                    </option>
                                    {unitData.building_no && unitData.building_no.map((item, index) => (
                                        <option value={item} key={index}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="location"
                                    className="block mb-2 text-sm montserrat-bold text-gray-900 dark:text-white"
                                >
                                    Floor
                                </label>
                                <select
                                    id="location"
                                    className=" bg-gray-200 border border-black text-gray-600 font-medium text-xs rounded-lg
             focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600
              dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option selected disabled>
                                        Please Select
                                    </option>

                                    {unitData.floor_no && unitData.floor_no.map((item, index) => (
                                        <option value={item} key={index}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label
                                    htmlFor="property"
                                    className="block mb-2 text-sm montserrat-bold text-gray-900 dark:text-white"
                                >
                                    Block
                                </label>
                                <select
                                    id="property"
                                    className=" bg-gray-200 border border-black text-gray-600 font-medium text-xs rounded-lg
           focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600
            dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option selected disabled>
                                        Please Select
                                    </option>
                                    {unitData.block && unitData.block.map((item, index) => (
                                        <option value={item} key={index}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="location"
                                    className="block mb-2 text-sm montserrat-bold text-gray-900 dark:text-white"
                                >
                                    Lot
                                </label>
                                <select
                                    id="location"
                                    className=" bg-gray-200 border border-black text-gray-600 font-medium text-xs rounded-lg
           focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 dark:bg-gray-700 dark:border-gray-600
            dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option selected disabled>
                                        Please Select
                                    </option>
                                    {unitData.lot && unitData.lot.map((item, index) => (
                                        <option value={item} key={index}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )} */}

                    <div>
                        <label
                            htmlFor="buildingTower"
                            className="block mb-[6px] text-sm montserrat-semibold"
                        >
                            Building / Tower
                        </label>
                        <select
                            id="buildingTower"
                            className=" bg-custom-grayFA w-[157px] h-[34px] text-[#404B52] text-xs rounded-[4px]"
                        >
                            <option selected disabled>
                                Please Select
                            </option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="floor"
                            className="block mb-[6px] text-sm montserrat-semibold"
                        >
                            Floor
                        </label>
                        <select
                            id="floor"
                            className=" bg-custom-grayFA w-[157px] h-[34px] text-[#404B52] text-xs rounded-[4px]"
                        >
                            <option selected disabled>
                                Please Select
                            </option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="bedroom"
                            className="block mb-[6px] text-sm montserrat-semibold"
                        >
                            Bedroom
                        </label>
                        <select
                            id="bedroom"
                            className=" bg-custom-grayFA w-[157px] h-[34px] text-[#404B52] text-xs rounded-[4px]"
                        >
                            <option selected disabled>
                                Please Select
                            </option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="bathroom"
                            className="block mb-[6px] text-sm montserrat-semibold"
                        >
                            Batroom
                        </label>
                        <select
                            id="bathroom"
                            className=" bg-custom-grayFA w-[157px] h-[34px] text-[#404B52] text-xs rounded-[4px]"
                        >
                            <option selected disabled>
                                Please Select
                            </option>
                        </select>
                    </div>
                    <div className='flex items-end'>
                        <div className="flex justify-center items-center w-[70px] h-[32px] bg-custom-solidgreen text-white rounded-[4px]">
                            <button className="">Search</button>
                        </div>
                    </div>
                </div>
                <div className='w-full flex justify-center'>
                    <div className="grid grid-cols-4 justify-center gap-[37px] w-[1023px] mt-9">
                        <UnitCards />
                        <UnitCards />
                        <UnitCards />
                        <UnitCards />
                    </div>
                </div>
                <div className='flex flex-col gap-[10px] w-full h-[100px] mt-[59px] justify-center'>
                    <p className='montserrat-regular text-[32px] text-custom-lightgreen'>Available units</p>
                    <p className='montserrat-regular text-sm text-custom-bluegreen'>legend</p>
                </div>
                <div className='flex h-[60px] w-full justify-center'>
                    <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#509ED1] rounded-l-[10px]'>
                        <input type="checkbox" />
                        <p className='w-full flex justify-center text-white text-[10px]'>93 - SOLD</p>
                    </div>
                    <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#1A73EB]'>
                        <input type="checkbox" />
                        <p className='w-full flex justify-center text-white text-[10px]'>20 - AVAILABLE</p>
                    </div>
                    <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#4ACA4F]'>
                        <input type="checkbox" />
                        <p className='w-full flex justify-center text-white text-[10px]'>12 - RESERVED</p>
                    </div>
                    <div className='flex w-[256px] h-[40px] px-[15px] py-[13px] bg-[#FF3B30] rounded-r-[10px]'>
                        <input type="checkbox" />
                        <p className='w-full flex justify-center text-white text-[10px]'>0 - BLOCKED</p>
                    </div>
                </div>
                <div className='flex justify-center'>
                    <div className='flex flex-col '>
                        <div className='flex'>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] rounded-tl-[10px] border border-[#B9B9B9]'>
                                FLOOR
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                1
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                2
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                3
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                4
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                5
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                6
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                7
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                8
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9] rounded-tr-[10px]'>
                                9
                            </div>
                        </div>
                        <div className='flex '>
                            <div className='flex justify-center items-center font-bold text-white text-[10px] w-[102px] h-[48px] bg-[#404B52] border border-[#B9B9B9]'>
                                1st
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#509ED1] border border-[#B9B9B9]'>
                                T101.001
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#1A73E8] border border-[#B9B9B9]'>
                                T102.001
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#4ACA4F] border border-[#B9B9B9]'>
                                T103.001
                            </div>
                            <div className='flex justify-center items-center font-bold text-white text-[11px] w-[102px] h-[48px] bg-[#FF3B30] border border-[#B9B9B9]'>
                                T104.001
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/*  <div>
                <ProjectModal modalRef={modalRef} unit={selectedUnit} project_name={projectName} />
            </div> */}
        </div>
    );
}

export default UnitDetails