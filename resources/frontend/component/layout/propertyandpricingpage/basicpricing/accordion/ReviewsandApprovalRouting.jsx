import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import * as XLSX from "xlsx";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import CircularProgress from "@mui/material/CircularProgress";

const staticHeaders = [
    "Floor",
    "Room",
    "Unit",
    "Type",
    "Indoor Area",
    "Balcony Area",
    "Garden Area",
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
    const [isExcelDownloading, setIsExcelDownloading] = useState(false);
    const [exportPricingData, setExportPricingData] = useState([]);
    const { units, excelId, excelIdFromPriceList, computedUnitPrices } =
        useUnit();
    const [priceVersions, setPriceVersions] = useState([]);
    const [subHeaders, setSubHeaders] = useState([]);
    const headers = [
        ...staticHeaders, // ["Floor", "Room", "Unit", "Type", ...]
        ...(subHeaders?.versionHeaders || []), // ["V1", "V2", ...]
        ...(subHeaders?.pricingHeaders || []), // ["Transfer Charge", "Vatable Less Price", ...]
    ];
    // Check if we have pricing headers
    const hasPricingHeaders = subHeaders?.pricingHeaders?.length > 0;
    // Check if we have version headers
    const hasVersionHeaders = subHeaders?.versionHeaders?.length > 0;

    //Hooks
    /**
     * This hooks, map the price_versions from propertyData to subHeaders and priceVersions
     */
    useEffect(() => {
        console.log("computedUnitPrices", computedUnitPrices);
        if (propertyData?.price_versions) {
            // console.log("propertyData", propertyData);
            const versionNames = propertyData.price_versions
                .map((item) => item.version_name)
                .filter(Boolean);
            const percentIncreaseHeaders = propertyData.price_versions
                .map((item) => item.percent_increase)
                .filter(Boolean);

            const priceDetails = propertyData.pricebasic_details;

            // Only set pricing headers if base_price is not 0
            if (priceDetails.base_price !== 0) {
                const excludedPriceListKeys = [
                    "id",
                    "created_at",
                    "updated_at",
                    "base_price",
                    "effective_balcony_base",
                    "vat",
                    "vatable_less_price",
                    "pricelist_master_id",
                ];

                // Extract property names that have non-zero values & are NOT in the excluded list
                const pricingKeys = Object.keys(priceDetails)
                    .filter(
                        (key) =>
                            !excludedPriceListKeys.includes(key) &&
                            priceDetails[key] &&
                            priceDetails[key] !== 0
                    )
                    .map((key) => key.replace(/_/g, " "))
                    .map((key) => {
                        // Capitalize each word
                        return key
                            .split(" ")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ");
                    });

                const pricingHeaders = [
                    "List price w/ VAT",
                    ...pricingKeys,
                    "Total Contract Price  ",
                ];
                setSubHeaders({
                    // versionHeaders: versionNames,
                    percentIncreaseHeaders: percentIncreaseHeaders,
                    pricingHeaders: pricingHeaders,
                });
            } else {
                // If base_price is 0, only set version headers without pricing headers
                setSubHeaders({
                    // versionHeaders: versionNames,
                    percentIncreaseHeaders: percentIncreaseHeaders,
                    pricingHeaders: [], // Empty array for no pricing headers
                });
            }

            setPriceVersions(propertyData.price_versions);
        }

        setExportPricingData((prev) => ({
            ...prev,
            ...pricingData,
            units: units,
        }));
    }, [propertyData, units]);

    //Event handlers

    const handleDownloadExcel = async () => {
        try {
            const payload = {
                project_name: propertyData?.property_name,
                building: propertyData?.tower_phase_name,
                // units: units,
                // priceVersions: priceVersions,
                exportPricingData: exportPricingData,
            };
            console.log("payload", payload);

            setIsExcelDownloading(true);
            const response =
                await priceListMasterService.exportPriceListMasterDataToExcel(
                    payload
                );

            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const url = window.URL.createObjectURL(blob);

            // Create a link element and trigger a download
            const link = document.createElement("a");
            link.href = url;
            link.download = "price_list_master.xlsx";
            link.click();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Error in downloading file", error);
        } finally {
            setIsExcelDownloading(false);
        }
    };
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
                        <div className="w-28">
                            {isExcelDownloading ? (
                                <CircularProgress className="spinnerSize h-6 w-6" />
                            ) : (
                                <p
                                    className="underline text-blue-500 text-sm cursor-pointer"
                                    onClick={handleDownloadExcel}
                                >
                                    Download Excel
                                </p>
                            )}
                        </div>
                        <div className="h-[400px] overflow-auto">
                            <div className="">
                                <h1 className="montserrat-semibold">
                                    VERTICAL INVENTORY PRICING TEMPLATE
                                </h1>
                                <div className="min-w-[500px]">
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
                                        <h6 className="w-1/3">
                                            NUMBER OF UNITS
                                        </h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>
                                                {(units && units.length) || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(excelId ? true : excelIdFromPriceList) && (
                                <div className="mt-4 w-80 ">
                                    <table className="bg-blue-900 w-full montserrat-regular">
                                        <thead>
                                            {/* First Row: Main Headers */}
                                            <tr>
                                                <th
                                                    colSpan={
                                                        staticHeaders.length
                                                    }
                                                    className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border"
                                                >
                                                    Unit
                                                </th>
                                                {/* Only show Version column if there are version headers */}
                                                {hasVersionHeaders && (
                                                    <th
                                                        colSpan={
                                                            subHeaders
                                                                .versionHeaders
                                                                .length
                                                        }
                                                        className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border px-2"
                                                    >
                                                        Version
                                                    </th>
                                                )}
                                                {hasPricingHeaders && (
                                                    <th
                                                        colSpan={
                                                            subHeaders
                                                                .pricingHeaders
                                                                .length
                                                        }
                                                        className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border px-2"
                                                    >
                                                        Pricing
                                                    </th>
                                                )}
                                            </tr>

                                            {/* Second Row: Column Titles */}
                                            <tr className="bg-[#aebee3] border-black border">
                                                {headers.map(
                                                    (title, headerIndex) => (
                                                        <th
                                                            key={headerIndex}
                                                            className={`${
                                                                title === "Type"
                                                                    ? "px-9"
                                                                    : title ===
                                                                      "List price w/ VAT"
                                                                    ? "px-10"
                                                                    : "px-4"
                                                            } py-4 border-black border montserrat-medium`}
                                                        >
                                                            {title}
                                                        </th>
                                                    )
                                                )}
                                            </tr>

                                            {/* Third Row: Only render if there are version headers */}
                                            {hasVersionHeaders && (
                                                <tr className="bg-[#aebee3] border-black border montserrat-regular">
                                                    <th
                                                        colSpan={
                                                            staticHeaders.length
                                                        }
                                                    ></th>

                                                    {/* Percent Increase Row */}
                                                    {subHeaders.percentIncreaseHeaders.map(
                                                        (percent, index) => (
                                                            <th
                                                                key={index}
                                                                className="font-normal"
                                                            >
                                                                {percent}%
                                                            </th>
                                                        )
                                                    )}

                                                    {/* Pricing Fields - only render if there are pricing headers */}
                                                    {hasPricingHeaders &&
                                                        subHeaders.pricingHeaders.map(
                                                            (
                                                                priceKey,
                                                                index
                                                            ) => (
                                                                <th
                                                                    key={index}
                                                                    className="montserrat-regular text-sm text-center pl-4"
                                                                ></th>
                                                            )
                                                        )}
                                                </tr>
                                            )}
                                        </thead>

                                        <tbody className="bg-white">
                                            {units &&
                                                units.map((unit, unitIndex) => {
                                                      const priceData =
                                                          computedUnitPrices.find(
                                                              (p) =>
                                                                  p.unit ===
                                                                  unit.unit
                                                          );
                                                         
                                                    return (
                                                        <tr key={unitIndex}>
                                                            {/* Map  Unit Data */}
                                                            <td className="px-2 border-black border">
                                                                {unit.floor}
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {
                                                                    unit.room_number
                                                                }
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {unit.unit}
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {unit.type}
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {
                                                                    unit.indoor_area
                                                                }
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {
                                                                    unit.balcony_area
                                                                }
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {
                                                                    unit.garden_area
                                                                }
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {
                                                                    unit.total_area
                                                                }
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {priceData?.computed_list_price_with_vat &&
                                                                    priceData?.computed_list_price_with_vat.toLocaleString()}
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {priceData?.computed_transfer_charge &&
                                                                    priceData?.computed_transfer_charge.toLocaleString()}
                                                            </td>
                                                            <td className="px-2 border-black border">
                                                                {priceData?.computed_reservation_fee &&
                                                                    priceData?.computed_reservation_fee.toLocaleString()}
                                                            </td>{" "}
                                                            <td className="px-2 border-black border">
                                                                {priceData?.computed_total_contract_price &&
                                                                    priceData?.computed_total_contract_price.toLocaleString()}
                                                            </td>
                                                            {/* Map Dynamic Price Versions */}
                                                            {/* {priceVersions.map(
                                                            (
                                                                version,
                                                                versionIndex
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        versionIndex
                                                                    }
                                                                    className="px-2 border-black border text-center"
                                                                >
                                                                    {version.no_of_allowed_buyers ||
                                                                        "-"}
                                                                </td>
                                                            )
                                                        )} */}
                                                            {/* {pricingData &&
                                                            Object.keys(
                                                                pricingData?.priceListSettings
                                                            ).length > 0 &&
                                                            pricingData
                                                                ?.priceListSettings
                                                                ?.base_price !==
                                                                0 &&
                                                            Object.keys(
                                                                pricingData?.priceListSettings
                                                            )
                                                                .filter((key) =>
                                                                    [
                                                                        "transfer_charge",
                                                                        "reservation_fee",
                                                                        "vatable_less_price",
                                                                    ].includes(
                                                                        key
                                                                    )
                                                                )
                                                                .map(
                                                                    (
                                                                        priceListItem
                                                                    ) => {
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    priceListItem
                                                                                }  
                                                                                className="px-2 border-black border text-center"
                                                                            >
                                                                                {
                                                                                    pricingData
                                                                                        .priceListSettings[
                                                                                        priceListItem
                                                                                    ]
                                                                                }{" "}
                                                                                
                                                                            </td>
                                                                        );
                                                                    }
                                                                )} */}
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
