import React, { useState, useEffect, useRef } from "react";
import {
    IoIosArrowDown,
    IoIosExpand,
    IoIosCloseCircle,
    IoMdArrowDropdown,
} from "react-icons/io";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import usePriceListEmployees from "@/component/layout/propertyandpricingpage/basicpricing/hooks/usePriceListEmployees";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateContext } from "@/context/contextprovider";
import EmployeeReviewerApproverModal from "@/component/layout/propertyandpricingpage/basicpricing/modals/ReviewSetting/EmployeeReviewerApproverModal";
import ExpandableDataTable from "@/component/layout/propertyandpricingpage/basicpricing/modals/ReviewSetting/ExpandableDataTable";
import { toLowerCaseText } from "@/component/layout/propertyandpricingpage/utils/formatToLowerCase";
import { usePropertyPricing } from "@/component/layout/propertyandpricingpage/basicpricing/hooks/usePropertyPricing";
import { formatPayload } from "@/component/layout/propertyandpricingpage/basicpricing/utils/payloadFormatter";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import CustomToolTip from "@/component/layout/mainComponent/Tooltip/CustomToolTip";
import UnitTableComponent from "@/component/layout/propertyandpricingpage/component/UnitTableComponent";
import { property } from "lodash";
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
    data,
    action,
}) => {
    //States
    const { fetchPropertyListMasters } = usePriceListMaster();
    const { pricingData, resetPricingData } = usePricing();
    const reviewerApproverModalRef = useRef(null);
    const expandUnitTableViewRef = useRef(null);
    const { user } = useStateContext();
    const {
        setFloorPremiumsAccordionOpen,
        units,
        excelId,
        excelIdFromPriceList,
        computedUnitPrices,
        checkExistingUnits,
    } = useUnit();
    const [priceVersions, setPriceVersions] = useState([]);
    const [subHeaders, setSubHeaders] = useState([]);
    const headers = [
        ...staticHeaders, // ["Floor", "Room", "Unit", "Type", ...]
        // ...(subHeaders?.versionHeaders || []), // ["V1", "V2", ...]
        ...(subHeaders?.pricingHeaders || []), // ["Transfer Charge", "Vatable Less Price", ...]
        // ...(subHeaders?.paymentSchemeHeaders || []), // ["Payment Scheme 1", "Payment Scheme 2", ...]
    ];
    const hasPricingHeaders = subHeaders?.pricingHeaders?.length > 0;
    // const hasVersionHeaders = subHeaders?.versionHeaders?.length > 0;
    const {
        handleRemoveEmployee,
        setApprovedByEmployees,
        setReviewedByEmployees,
    } = usePriceListEmployees();
    const { isLoading, handleSubmit } = usePropertyPricing(
        user,
        data,
        formatPayload,
        pricingData,
        resetPricingData,
        showToast,
        fetchPropertyListMasters,
        checkExistingUnits
    );
    const [type, setModalType] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [isExcelDownloading, setIsExcelDownloading] = useState(false);
    const [exportPricingData, setExportPricingData] = useState([]);

    //Hooks
    /*
     * This effect maps the price_versions from propertyData to subHeaders and priceVersions.
     * It also initializes selectedVersion, pricing headers, and employee selections.
     */

    useEffect(() => {
        // If no version is selected, set the default to the one with priority_number === 1
        // setSelectedVersion((prev) => {
        //     if (!prev) {
        //         const priorityVersion = propertyData.price_versions.find(
        //             (item) => item.priority_number === 1
        //         );
        //         return priorityVersion?.version_name || "";
        //     }
        //     return prev;
        // });

        // Extract percent increase headers
        // const percentIncreaseHeaders = propertyData.price_versions
        //     .map((item) => item.percent_increase)
        //     .filter(Boolean);

        //Filter payment schemes dynamically based on the selected version
        // const paymentSchemeHeaders = propertyData.price_versions
        //     .filter((item) => item.version_name === selectedVersion)
        //     .flatMap(
        //         (item) =>
        //             item.payment_schemes?.map(
        //                 (scheme) => scheme.payment_scheme_name
        //             ) || []
        //     );

        const priceDetails =
            propertyData?.pricebasic_details || pricingData?.priceListSettings;
        let pricingHeaders = [];
        if (priceDetails && priceDetails.base_price !== 0) {
            const excludedKeys = new Set([
                "id",
                "created_at",
                "updated_at",
                "base_price",
                "effective_balcony_base",
                "vat",
                "vatable_less_price",
                "pricelist_master_id",
            ]);

            // Extract pricing headers, format them
            pricingHeaders = [
                "List price w/ VAT",
                ...Object.keys(priceDetails)
                    .filter(
                        (key) =>
                            !excludedKeys.has(key) &&
                            priceDetails[key] &&
                            priceDetails[key] !== 0
                    )
                    .map((key) => key.replace(/_/g, " ")) // Replace underscores with spaces
                    .map((key) =>
                        key
                            .split(" ")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")
                    ), // Capitalize words
                "Total Contract Price",
            ];
        }

        //Set headers and price versions
        setSubHeaders({
            // paymentSchemeHeaders,
            // percentIncreaseHeaders,
            pricingHeaders,
        });

        // setPriceVersions(propertyData?.price_versions);
        //Update export pricing data with the latest computed unit prices
        setExportPricingData((prev) => ({
            ...prev,
            ...pricingData,
            units: computedUnitPrices,
        }));

        //Initialize selected employees, ensuring the state never holds null values
        setReviewedByEmployees(pricingData.reviewedByEmployees || []);
        setApprovedByEmployees(pricingData.approvedByEmployees || []);
    }, [propertyData, units, selectedVersion, pricingData]);

    //Event handlers
    const handleDownloadExcel = async () => {
        try {
            const payload = {
                project_name: propertyData?.property_name,
                building: propertyData?.tower_phase_name,
                exportPricingData: exportPricingData,
                selectedVersion: selectedVersion,
            };

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

    //Handle to open the customer list modal
    const handleOpenEmployeeReviewerApproverModal = (type) => {
        if (reviewerApproverModalRef.current) {
            setModalType(type);
            reviewerApproverModalRef.current.showModal();
        }
    };

    //Handle to close the customer list modal
    const handleCloseEmployeeReviewerApproverModal = () => {
        if (reviewerApproverModalRef.current) {
            setModalType(null);
            reviewerApproverModalRef.current.close();
        }
    };

    //Handle select version
    const handleSelectVersion = (e) => {
        const { value } = e.target;
        setSelectedVersion(value);
    };

    //Handle price list submit
    const handleFormSubmit = (e, status) => {
        handleSubmit(e, status, action, excelId, setFloorPremiumsAccordionOpen);
    };

    //Handle open expand unit table view
    const toggleExpandUnitTableView = () => {
        if (expandUnitTableViewRef.current) {
            expandUnitTableViewRef.current.showModal();
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
                    <div className="p-[20px] space-y-[10px]">
                        {(excelId ||
                            excelIdFromPriceList ||
                            computedUnitPrices.length > 0) && (
                            <div className="flex items-center justify-between">
                                {/* Download Excel section */}
                                {isExcelDownloading ? (
                                    <CircularProgress className="h-6 w-6 spinnerSize" />
                                ) : computedUnitPrices.length > 0 ? (
                                    <p
                                        className="text-sm text-blue-500 underline cursor-pointer"
                                        onClick={handleDownloadExcel}
                                    >
                                        Download Excel
                                    </p>
                                ) : (
                                    <div />
                                )}

                                {/* Expand Table View button */}
                                {computedUnitPrices.length > 0 && (
                                    <div className="px-5 text-black">
                                        <CustomToolTip
                                            text="Expand Table View"
                                            position="left"
                                        >
                                            <button
                                                onClick={
                                                    toggleExpandUnitTableView
                                                }
                                                aria-label="ExpandTableView"
                                                className="flex items-center"
                                            >
                                                <IoIosExpand className="text-[25px]" />
                                            </button>
                                        </CustomToolTip>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="h-[400px] overflow-auto">
                            <div className="">
                                <h1 className="montserrat-semibold">
                                    VERTICAL INVENTORY PRICING TEMPLATE
                                </h1>
                                <div className="min-w-[500px]">
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">PROJECT</h6>
                                        <div className="border border-black px-6 flex-1 ml-10">
                                            <p>
                                                {propertyData?.property_name ||
                                                    propertyData?.data
                                                        ?.property_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">BUILDING</h6>
                                        <div className="border border-black px-6 flex-1  ml-10">
                                            <p>
                                                {propertyData?.tower_phase_name ||
                                                    propertyData?.data
                                                        ?.tower_phases[0]
                                                        ?.tower_phase_name}
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
                                    <div className="flex w-full max-w-[450px]">
                                        <h6 className="w-1/3">VERSION</h6>
                                        <div className="border border-black  flex-1  ml-10">
                                            <div className="relative w-full  ">
                                                <select
                                                    onChange={(e) =>
                                                        handleSelectVersion(e)
                                                    }
                                                    name="version"
                                                    className="appearance-none w-full px-5 py-1   focus:outline-none border-0"
                                                >
                                                    {pricingData?.priceVersions &&
                                                        pricingData?.priceVersions.map(
                                                            (
                                                                version,
                                                                index
                                                            ) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        version.name
                                                                    }
                                                                >
                                                                    {toLowerCaseText(
                                                                        version.name
                                                                    )}
                                                                </option>
                                                            )
                                                        )}
                                                </select>
                                                <span className="absolute inset-y-0 right-0 flex text-custom-gray81 items-center  pointer-events-none">
                                                    <IoMdArrowDropdown />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(excelId ? true : excelIdFromPriceList) && (
                                <UnitTableComponent
                                    tableWidth="w-80"
                                    computedUnitPrices={computedUnitPrices}
                                    units={units}
                                    headers={headers}
                                    staticHeaders={staticHeaders}
                                    // hasVersionHeaders={hasVersionHeaders}
                                    hasPricingHeaders={hasPricingHeaders}
                                    subHeaders={subHeaders}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-[10px] w-full">
                            <div className="bg-custombg3 h-[49px] rounded-md flex px-2 items-center">
                                <div className="w-[250px]">
                                    <p className="montserrat-semibold">
                                        Prepared by
                                    </p>
                                </div>
                                <div className="w-[280px]">
                                    {" "}
                                    <p className="montserrat-semibold">
                                        Reviewed by
                                    </p>
                                </div>
                                <div className="  w-[280px]">
                                    {" "}
                                    <p className="montserrat-semibold">
                                        Approved by
                                    </p>
                                </div>
                            </div>
                            <div className="mt-1 bg-custombg3 h-auto rounded-md px-1 flex">
                                {/* Prepared by */}
                                <div className="w-[250px]">
                                    <p className="montserrat-regular p-2">
                                        {user?.firstname} {user?.lastname}
                                    </p>
                                </div>

                                {/*  Reviewed By */}
                                <div className="w-[250px] flex flex-col min-h-[170px] ">
                                    <div className="flex-1">
                                        {pricingData?.reviewedByEmployees &&
                                            pricingData?.reviewedByEmployees.map(
                                                (emp) => {
                                                    return (
                                                        <div
                                                            className="flex justify-between items-center"
                                                            key={emp?.id}
                                                        >
                                                            <p className="montserrat-regular p-2">
                                                                {emp?.name}
                                                            </p>
                                                            <IoIosCloseCircle
                                                                onClick={() =>
                                                                    handleRemoveEmployee(
                                                                        emp.id,
                                                                        "reviewedByEmployees"
                                                                    )
                                                                }
                                                                className="h-6 w-6 cursor-pointer  text-red-500"
                                                            />
                                                        </div>
                                                    );
                                                }
                                            )}
                                    </div>

                                    <div className="mt-auto py-2">
                                        <button
                                            className="gradient-btn5 p-[1px] w-[75px] h-[30px] rounded-[10px]"
                                            onClick={() =>
                                                handleOpenEmployeeReviewerApproverModal(
                                                    "reviewedByEmployees"
                                                )
                                            }
                                        >
                                            <div className="w-full h-full rounded-[8px] bg-white flex justify-center items-center montserrat-regular text-sm">
                                                <p className="text-base  bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                    Add +
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/*  Approved By */}
                                <div className="w-[250px] ml-8 flex flex-col min-h-[170px]">
                                    <div className="flex-1">
                                        {pricingData?.approvedByEmployees &&
                                            pricingData?.approvedByEmployees.map(
                                                (emp) => {
                                                    return (
                                                        <div
                                                            className="flex justify-between items-center"
                                                            key={emp?.id}
                                                        >
                                                            <p className="montserrat-regular p-2">
                                                                {emp?.name}
                                                            </p>
                                                            <IoIosCloseCircle
                                                                onClick={() =>
                                                                    handleRemoveEmployee(
                                                                        emp.id,
                                                                        "approvedByEmployees"
                                                                    )
                                                                }
                                                                className="h-6 w-6 cursor-pointer  text-red-500"
                                                            />
                                                        </div>
                                                    );
                                                }
                                            )}
                                    </div>
                                    {/* Button */}
                                    <div className="mt-auto py-2">
                                        <button
                                            className="gradient-btn5 p-[1px] w-[75px] h-[30px] rounded-[10px]"
                                            onClick={() =>
                                                handleOpenEmployeeReviewerApproverModal(
                                                    "approvedByEmployees"
                                                )
                                            }
                                        >
                                            <div className="w-full h-full rounded-[8px] bg-white flex justify-center items-center montserrat-regular text-sm">
                                                <p className="text-base bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                                    Add +
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 justify-center  py-3">
                            <button
                                className="h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4"
                                onClick={(e) =>
                                    handleFormSubmit(e, "On-going Approval")
                                }
                            >
                                {isLoading["On-going Approval"] ? (
                                    <CircularProgress className="spinnerSize" />
                                ) : (
                                    <> Submit for Approval </>
                                )}
                            </button>
                            <button
                                className="h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn5 hover:shadow-custom4 p-[3px]"
                                onClick={(e) => handleFormSubmit(e, "Draft")}
                            >
                                <div className="flex justify-center items-center h-full w-full rounded-[8px] bg-white">
                                    {isLoading["Draft"] ? (
                                        <CircularProgress className="spinnerSize" />
                                    ) : (
                                        <>Save as Draft</>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <EmployeeReviewerApproverModal
                    type={type}
                    onClose={handleCloseEmployeeReviewerApproverModal}
                    reviewerApproverModalRef={reviewerApproverModalRef}
                />
            </div>
            <div>
                <ExpandableDataTable
                    // hasVersionHeaders={hasVersionHeaders}
                    // hasPricingHeaders={hasPricingHeaders}
                    // subHeaders={subHeaders}
                    // headers={headers}
                    // staticHeaders={staticHeaders}
                    // computedUnitPrices={computedUnitPrices}
                    computedUnitPrices={computedUnitPrices}
                    units={units}
                    headers={headers}
                    staticHeaders={staticHeaders}
                    // hasVersionHeaders={hasVersionHeaders}
                    hasPricingHeaders={hasPricingHeaders}
                    subHeaders={subHeaders}
                    expandUnitTableViewRef={expandUnitTableViewRef}
                />
            </div>
        </>
    );
};

export default ReviewsandApprovalRouting;
