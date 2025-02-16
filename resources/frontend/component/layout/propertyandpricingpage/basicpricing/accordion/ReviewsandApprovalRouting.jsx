import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";

const staticHeaders = [
    "Floor",
    "Room",
    "Unit",
    "Type",
    "Indoor Area",
    "Balcony Area",
    "Total Area",
];

const ReviewsandApprovalRouting = ({
    isOpen,
    toggleAccordion,
    propertyData,
    isReviewAndApprovalAccordionOpen,
}) => {
    //States
    const { pricingData } = usePricing();
    const { units } = useUnit();
    const [priceVersions, setPriceVersions] = useState([]);
    const [priceVersionsName, setPriceVersionsName] = useState([]);
    const headers = [...staticHeaders, ...priceVersionsName];
    // const unitsData = [
    //     {
    //         floor: 2,
    //         room: 1,
    //         unit: "T102.001",
    //         type: "Studio",
    //         indoorArea: 24,
    //         balconyArea: 3.25,
    //         totalArea: 23.25,
    //     },
    // ];
    // console.log("unitsData", units);
    //Hooks
    /**
     * This hooks, map the price_versions from propertyData to priceVersionsName and priceVersions
     */
    useEffect(() => {
        if (
            propertyData?.price_versions &&
            Array.isArray(propertyData.price_versions)
        ) {
            const versionNames = propertyData.price_versions
                .map((item) => item.version_name)
                .filter(Boolean);

            setPriceVersionsName(versionNames);
            setPriceVersions(propertyData.price_versions);
        } else {
            console.error(
                "propertyData?.price_versions is not an array:",
                propertyData?.price_versions
            );
        }
    }, [propertyData]);

    useEffect(() => {}, [isReviewAndApprovalAccordionOpen]);
    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${
          isOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] px-[15px gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => toggleAccordion("reviewsAndApproval")}
                    className={`
            ${
                isOpen
                    ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                    : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
            } `}
                >
                    <span
                        className={` text-custom-solidgreen ${
                            isOpen
                                ? "text-[20px] montserrat-semibold"
                                : "text-[18px] montserrat-regular"
                        }`}
                    >
                        Review and Approval Routing
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${
                            isOpen
                                ? "rotate-180 bg-[#F3F7F2] text-custom-solidgreen"
                                : "rotate-0 gradient-btn2 text-white"
                        }`}
                    >
                        <IoIosArrowDown className=" text-[18px]" />
                    </span>
                </button>
            </div>
            <div
                className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${
                isOpen
                    ? "mt-2 mb-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
            overflow-auto`}
            >
                <div className="  ">
                    <div className="p-[20px] space-y-[10px] ">
                        <div>
                            <p className="underline text-blue-500 text-sm cursor-pointer">
                                Download Excel
                            </p>
                        </div>
                        <div className="  h-[400px] overflow-auto">
                            <div className="">
                                <h1 className="montserrat-semibold">
                                    VERTICAL INVENTORY PRICING TEMPLATE
                                </h1>
                                <div className="min-w-[500px]  ">
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">PROJECT</h6>
                                        <div className="border border-black px-6 flex-1 ml-10">
                                            <p>{propertyData?.property_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">BUILDING</h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>
                                                {propertyData?.tower_phase_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">VERSION</h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>V1</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">
                                            NUMBER OF UNITS
                                        </h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>123</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">
                                            PRICE LIST TYPE
                                        </h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>As Approved</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">VERSION DATE</h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>02/14/2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 w-80">
                                <table className="bg-blue-900 w-full montserrat-regular">
                                    <thead>
                                        <tr>
                                            <th
                                                colSpan="7"
                                                className="bg-[#31498a] w-full py-3 montserrat-bold text-white border-black border"
                                            >
                                                Unit
                                            </th>
                                            <th
                                                colSpan="6"
                                                className="bg-[#31498a] w-full py-3 montserrat-bold text-white border-black border px-2"
                                            >
                                                Version
                                            </th>
                                        </tr>
                                        <tr className="bg-[#aebee3] border-black border">
                                            {headers &&
                                                headers.map((title, index) => (
                                                    <th
                                                        key={title}
                                                        className={`${
                                                            title === "Type"
                                                                ? "px-9"
                                                                : "px-4"
                                                        } py-4  border-black border montserrat-semibold ${
                                                            index === 0
                                                                ? "min-w-[20px]"
                                                                : ""
                                                        }`}
                                                    >
                                                        {title}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {units &&
                                            units.map((unit, index) => (
                                                <tr key={index}>
                                                    {/* Map  Unit Data */}
                                                    <td className="px-2 border-black border">
                                                        {unit.floor}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.room_number}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.unit}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.type}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.indoor_area}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.balcony_area}
                                                    </td>
                                                    <td className="px-2 border-black border">
                                                        {unit.total_area}
                                                    </td>

                                                    {/* Map Dynamic Price Versions */}
                                                    {priceVersions.map(
                                                        (
                                                            version,
                                                            versionIndex
                                                        ) => (
                                                            <td
                                                                key={
                                                                    versionIndex
                                                                }
                                                                className="px-2 border-black border"
                                                            >
                                                                {version.no_of_allowed_buyers ||
                                                                    "-"}
                                                            </td>
                                                        )
                                                    )}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-[10px] w-[429px]">
                            <div className="flex  items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex w-[80%] h-[31px] pl-3 py-1">
                                    Prepared by
                                </span>
                                <input
                                    name="preparedBy"
                                    type="text"
                                    className="w-full h-[31px] px-4 focus:outline-none"
                                    placeholder=""
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[80%] h-[31px] -mr-3 pl-3 py-1">
                                    Reviewed by
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="reviewedBy"
                                        className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    >
                                        <option value="">
                                            Firstname M. Lastname
                                        </option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex text-custom-gray81 items-center pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-md overflow-hidden w-[375px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[80%] h-[31px] -mr-3 pl-3 py-1">
                                    Approved by
                                </span>
                                <div className="relative w-full">
                                    <select
                                        name="approvedBy"
                                        className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    >
                                        <option value="">
                                            Firstname M. Lastname
                                        </option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center text-custom-gray81 pr-3 pl-3 bg-custom-grayFA pointer-events-none">
                                        <IoMdArrowDropdown />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 justify-center">
                            <button className="h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4">
                                Submit for Approval
                            </button>
                            <button className="h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4 p-[3px]">
                                <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                                    Save as Draft
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReviewsandApprovalRouting;
