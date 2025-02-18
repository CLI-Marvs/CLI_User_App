import React from "react";
import { toLowerCaseText } from "@/component/layout/propertyandpricingpage/utils/formatToLowerCase";

const ProjectDetails = ({ propertyData }) => {
    return (
        <>
            <div className="min-w-full h-[180px] bg-custom-lightestgreen p-[20px] rounded-[10px] ">
                <div className="h-full flex flex-col justify-between ">
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Property Name
                            </p>
                        </div>
                        <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className="text-custom-gray81 text-xs">
                                {toLowerCaseText(
                                    propertyData?.data?.property_name ||
                                        propertyData?.property_name
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Type
                            </p>
                        </div>
                        <div className="h-[26px] w-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className="text-custom-gray81 text-xs">
                                {propertyData?.data?.property_commercial_detail
                                    ?.type ||
                                    propertyData?.property_commercial_detail
                                        ?.type}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Tower/Phase
                            </p>
                        </div>
                        <div className=" w-auto h-[26px] px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className=" text-custom-gray81 text-xs">
                                {propertyData?.data?.tower_phases[0]
                                    ?.tower_phase_name ||
                                    propertyData?.tower_phase_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div>
                            <p className="text-sm font-semibold text-custom-bluegreen w-[120px]">
                                Description
                            </p>
                        </div>
                        <div className=" w-auto h-auto px-[15px] py-[5px] bg-white rounded-[5px]">
                            <p className=" text-custom-gray81 text-xs">
                                {propertyData?.data?.tower_phases[0]
                                    ?.tower_description ||
                                    propertyData?.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectDetails;
