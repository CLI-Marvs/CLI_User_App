import React, { useEffect, useRef, useState } from "react";
import ProjectDetails from "./ProjectDetails";
import PriceListSettings from "./accordion/PriceListSettings";
import AdditionalPremiums from "./accordion/AdditionalPremiums";
import PriceVersions from "./accordion/PriceVersions";
import moment from "moment";
import ReviewsandApprovalRouting from "./accordion/ReviewsandApprovalRouting";
import FloorPremiums from "./accordion/FloorPremiums";
import { useLocation } from "react-router-dom";
import UploadUnitDetailsModal from "./modals/UploadUnitDetailsModal";
import { useStateContext } from "../../../../context/contextprovider";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService";
import expectedHeaders from "@/constant/data/excelHeader";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { formatPayload } from "@/component/layout/propertyandpricingpage/basicpricing/utils/payloadFormatter";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import CircularProgress from "@mui/material/CircularProgress";

const BasicPricing = () => {
    //State
    const navigate = useNavigate();
    const { user } = useStateContext();
    const modalRef = useRef(null);
    const uploadUnitModalRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { data = {}, action = null } = location.state || {};
    const [propertyData, setPropertyData] = useState();
    const [fileName, setFileName] = useState("");
    const [fileSelected, setFileSelected] = useState({});
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);
    const [lastFetchedExcelId, setLastFetchedExcelId] = useState(null);
    const {
        pricingData,
        resetPricingData,
        setPricingData,
        additionalPremiums,
    } = usePricing();
    const { fetchPropertyListMasters } = usePriceListMaster();
    const [isLoading, setIsLoading] = useState({});
    const {
        checkExistingUnits,
        floors,
        setFloors,
        setFloorPremiumsAccordionOpen,
    } = useUnit();
    const [accordionStates, setAccordionStates] = useState({
        priceListSettings: false,
        floorPremium: false,
        additionalPremiums: false,
        priceVersions: false,
        reviewAndApprovalSetting: false,
    });
    console.log("PricingData in BasicPricing", pricingData);

    //Hooks
    /**
     * Hook to update pricing data based on incoming 'data' prop.
     * It sets propertyData, updates priceListSettings, priceVersions, floorPremiums, and additionalPremiums within the pricingData state.
     * It handles data transformations, particularly for floorPremiums (reducing to an object keyed by floor) and additionalPremiums (converting premiumCost to a number).
     * It also provides default values for priceVersions if none are available in the incoming data.  Uses moment.js for date formatting.
     */
    useEffect(() => {
        if (data) {
            setPropertyData(data);
            // Update the priceListSettings
            if (data?.pricebasic_details) {
                setPricingData((prev) => ({
                    ...prev,
                    priceListSettings: {
                        ...prev.pricebasic_details,
                        ...data.pricebasic_details,
                    },
                }));
            }
            // Update the price versions
            if (data?.price_versions) {
                setPricingData((prev) => ({
                    ...prev,
                    priceVersions: data.price_versions.length
                        ? data.price_versions.map((version) => ({
                              id: version.version_id || "",
                              name: version.version_name || "",
                              percent_increase: version.percent_increase || 0,
                              status: version.status,
                              no_of_allowed_buyers:
                                  version.no_of_allowed_buyers || 0,
                              expiry_date: version.expiry_date
                                  ? moment(version.expiry_date).format(
                                        "MM-DD-YYYY HH:mm:ss"
                                    )
                                  : moment(new Date()).format(
                                        "MM-DD-YYYY HH:mm:ss"
                                    ),
                              payment_scheme: version.payment_schemes || [],
                          }))
                        : [
                              {
                                  id: 0,
                                  name: "",
                                  percent_increase: "",
                                  no_of_allowed_buyers: "",
                                  status: "Active",
                                  expiry_date: moment().isValid()
                                      ? moment(new Date()).format(
                                            "MM-DD-YYYY HH:mm:ss"
                                        )
                                      : "",
                                  payment_scheme: [],
                              },
                          ],
                }));
            }

            // Update the floor premiums
            if (data?.floor_premiums && data?.floor_premiums.length > 0) {
                console.log("Floor premiums have data 1", data?.floor_premiums);
                const floorPremiumData = data?.floor_premiums.reduce(
                    (acc, premium) => {
                        acc[premium.floor] = {
                            id: premium.id,
                            premiumCost:
                                premium.premium_cost === "0.00"
                                    ? 0
                                    : premium.premium_cost,
                            luckyNumber: premium.lucky_number,
                            excludedUnits: premium.excluded_units,
                        };
                        return acc;
                    },
                    {}
                );
                setPricingData((prev) => ({
                    ...prev,
                    floorPremiums: floorPremiumData,
                }));
            }

            //Update the additional premiums
            if (
                data?.additional_premiums &&
                data?.additional_premiums.length > 0
            ) {
                const updatedPremiums = data?.additional_premiums.map(
                    (item) => ({
                        ...item,
                        premiumCost:
                            item.premiumCost === "0.00" ||
                            item.premiumCost === 0
                                ? 0
                                : item.premiumCost,
                    })
                );

                setPricingData((prev) => ({
                    ...prev,
                    additionalPremiums: updatedPremiums,
                }));
            }
        }
    }, [data]);

    /**
     * Hook to handle fetching and clearing of floor and pricing data based on the excel_id.
     * It clears existing data if excel_id is null and fetches new data if the excel_id is valid and different from the last fetched ID.
     * It also handles setting the additionalPremiums if it's currently empty.
     */
    useEffect(() => {
        if (!data?.excel_id) {
            console.log(
                "Excel ID is null, clearing previous data",
                data?.excel_id
            );

            if (
                floors.length > 0 ||
                Object.keys(pricingData.floorPremiums).length > 0
            ) {
                setFloors([]);
                setPricingData((prev) => ({
                    ...prev,
                    floorPremiums: [],
                    additionalPremiums: [],
                }));
            }
            return;
        }

        if (
            data?.excel_id &&
            data?.excel_id !== lastFetchedExcelId &&
            (floors.length === 0 ||
                Object.keys(pricingData.floorPremiums).length === 0)
        ) {
            console.log(
                "Fetching floors because no existing data is found for",
                data?.excel_id
            );
            checkExistingUnits(data.tower_phase_id, data.excel_id);
            setLastFetchedExcelId(data?.excel_id); // ✅ Track last fetched ID
        }
        if (pricingData.additionalPremiums.length === 0) {
            setPricingData((prev) => ({
                ...prev,
                additionalPremiums: additionalPremiums,
            }));
        }
    }, [data?.excel_id, data?.tower_phase_id]);

    // Hooks to reset all accordions when leaving the page 'BasicPricing'
    useEffect(() => {
        return () => {
            setAccordionStates({
                priceListSettings: false,
                additionalPremiums: false,
            });
        };
    }, [location]);

    //Event handler
    // Function to toggle a specific accordion
    const toggleAccordion = (name) => {
        setAccordionStates((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    // Open the add property modal
    const handleOpenAddPropertyModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    //Handle to open the unit upload modal
    const handleOpenUnitUploadModal = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    /**
     * Handles the process of uploading an Excel file, extracting the headers
     */
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setFileSelected(file);
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
            }); //all data in excel

            const selectedHeaders = jsonData[0]; // First row contains headers
            const dataRows = jsonData.slice(1); // All rows after the first one

            // Check for missing headers
            const missingHeaders = expectedHeaders.filter(
                (header) => !selectedHeaders.includes(header)
            );

            //Check for extra headers
            const extraHeaders = selectedHeaders.filter(
                (header) => !expectedHeaders.includes(header)
            );

            // Notify user if missing headers are found
            if (missingHeaders.length > 0) {
                //TODO: Convert this into Toast
                alert(
                    `Please check your Excel header row.\nMissing Headers: ${missingHeaders.join(
                        ", "
                    )}`
                );
                setSelectedExcelHeader([]);
                return;
            }

            // Notify user if extra headers are found, but continue with expected headers
            if (extraHeaders.length > 0) {
                //TODO: Convert this into Toast
                alert(
                    `Please check your Excel header row.\nExtra Headers: ${extraHeaders.join(
                        ", "
                    )}\nProcessing will continue with expected headers only.`
                );
            }

            const reorderedHeaders = expectedHeaders.map((expectedHeader) => {
                // Find the index of the selected header that matches the expected header
                const selectedIndex = selectedHeaders.indexOf(expectedHeader);
                return {
                    rowHeader: expectedHeader,
                    columnIndex: selectedIndex + 1, // Adjust for 1-based column index
                };
            }); //Reorder filtered headers based on expected headers order

            // Now we need to reorder data rows based on this mapping
            const reorderedData = dataRows.map((row) => {
                const reorderedRow = {};
                reorderedHeaders.forEach((headerMapping) => {
                    reorderedRow[headerMapping.rowHeader] =
                        row[headerMapping.columnIndex];
                });
                return reorderedRow;
            });

            //  console.log("reorderedData", reorderedData);
            // Save the formatted headers
            setSelectedExcelHeader(reorderedHeaders);
            //  setExcelData(reorderedData);
            // Proceed with your modal display logic
            if (uploadUnitModalRef.current) {
                uploadUnitModalRef.current.showModal();
            }
        };

        reader.readAsArrayBuffer(file);
    };

    /*
     * Payload object for submission with the provided status.
     * The payload includes employee ID, tower phase ID, price list settings, payment scheme, and the specified status.
     * @param {*} status
     * @returns
     */
    const buildSubmissionPayload = (status) => ({
        emp_id: user?.id,
        price_list_master_id:
            data?.price_list_master_id ||
            data?.data?.property_commercial_detail?.property_master_id,
        tower_phase_id: data.data?.tower_phases[0]?.id || data?.tower_phase_id,
        priceListPayload: formatPayload.formatPriceListSettingsPayload(
            pricingData.priceListSettings
        ),
        paymentSchemePayload: pricingData.paymentSchemes,
        priceVersionsPayload: formatPayload.formatPriceVersionsPayload(
            pricingData.priceVersions
        ),
        floorPremiumsPayload: formatPayload.formatMultipleFloorPremiums(
            pricingData.floorPremiums
        ),
        additionalPremiumsPayload:
            formatPayload.formatAdditionalPremiumsPayload(
                pricingData.additionalPremiums
            ),
        selectedAdditionalPremiumsPayload:
            formatPayload.formatSelectedAdditionalPremiumsPayload(
                pricingData.selectedAdditionalPremiums
            ),
        status: status,
    });
    /**
     * Handles in submitting all data in creating price master list
     */
    const handleSubmit = async (e, status) => {
        e.preventDefault();
        if (action === "Edit") {
            try {
                setIsLoading((prev) => ({ ...prev, [status]: true }));
                const payload = buildSubmissionPayload(status);
                console.log("Edit Payload", payload);
                // console.log("Edit Payload", JSON.stringify(payload));

                const response =
                    await priceListMasterService.updatePriceListMasters(
                        payload
                    );
                console.log("response", response);
                if (response?.status === 201 || response?.status === 200) {
                    showToast(
                        response?.data?.message || "Data updated successfully",
                        "success"
                    );

                    // Reset data and navigate to master list page
                    await fetchPropertyListMasters(true);
                    setTimeout(() => {
                        navigate("/property-pricing/master-lists");
                    }, 1000);
                    setFloorPremiumsAccordionOpen(false);
                } else {
                    console.log(
                        "Unexpected response status:",
                        response?.status,
                        response
                    );
                    showToast(
                        "Unexpected response received. Please verify the changes.",
                        "warning"
                    );
                }
            } catch (error) {
                if (error.response?.data?.message) {
                    showToast(error.response.data.message, "error");
                } else {
                    showToast(
                        "An error occurred during submission. Please try again.",
                        "error"
                    );
                }
            } finally {
                setIsLoading((prev) => ({ ...prev, [status]: false }));
            }
        } else {
            try {
                setIsLoading((prev) => ({ ...prev, [status]: true }));
                const payload = buildSubmissionPayload(status);
                console.log("ADd Payload", payload);

                const response =
                    await priceListMasterService.storePriceListMasters(payload);
                console.log("response 235", response);
                if (response?.status === 201 || response?.status === 200) {
                    showToast(
                        response?.data?.message || "Data added successfully",
                        "success"
                    );
                    // Reset data and navigate to master list page
                    resetPricingData();
                    await fetchPropertyListMasters(true);

                    setTimeout(() => {
                        navigate("/property-pricing/master-lists");
                    }, 1000);
                    setFloorPremiumsAccordionOpen(false);
                } else {
                    console.log(
                        "Unexpected response status:",
                        response?.status,
                        response
                    );
                    showToast(
                        "Unexpected response received. Please verify the changes.",
                        "warning"
                    );
                }
            } catch (error) {
                if (error.response?.data?.message) {
                    showToast(error.response.data.message, "error");
                } else {
                    showToast(
                        "An error occurred during submission. Please try again.",
                        "error"
                    );
                }
            } finally {
                setIsLoading((prev) => ({ ...prev, [status]: false }));
            }
        }
    };

    return (
        <div className="h-screen max-w-[957px] min-w-[897px] bg-custom-grayFA px-[30px] ">
            {/* button ra if walay pa property */}
            {/* <div className="px-5 mb-7  ">
                {!passPropertyData && (
                    <button
                        onClick={handleOpenAddPropertyModal}
                        className="montserrat-semibold text-sm px-2 gradient-btn2 w-[214px] h-[37px] rounded-[10px] text-white hover:shadow-custom4"
                    >
                        Add Property and Pricing
                    </button>
                )}
            </div> */}
            {/* kung naa nay property */}
            {propertyData && Object.keys(propertyData).length > 0 && (
                <ProjectDetails propertyData={propertyData} />
            )}

            <div className="flex gap-[15px] py-5">
                <button
                    onClick={handleOpenUnitUploadModal}
                    className="h-[37px] w-[162px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4"
                >
                    Upload Unit Details
                </button>
                <button
                    className={`h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 ${
                        isLoading["On-going Approval"]
                            ? "cursor-not-allowed opacity-50"
                            : ""
                    }`}
                    type="submit"
                    onClick={(e) => handleSubmit(e, "On-going Approval")}
                >
                    {isLoading["On-going Approval"] ? (
                        <CircularProgress className="spinnerSize" />
                    ) : (
                        <> Submit for Approval </>
                    )}
                </button>
                <button
                    className={`h-[37px] w-[117px] rounded-[10px] text-custom-solidgreen montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 p-[3px] ${
                        isLoading["On-going Approval"]
                            ? "cursor-not-allowed opacity-50"
                            : ""
                    }`}
                    type="submit"
                    onClick={(e) => handleSubmit(e, "Draft")}
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
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <div>
                <UploadUnitDetailsModal
                    propertyData={propertyData}
                    handleFileChange={handleFileChange}
                    uploadUnitModalRef={uploadUnitModalRef}
                    fileName={fileName}
                    selectedExcelHeader={selectedExcelHeader}
                    fileSelected={fileSelected}
                />
            </div>
            <div className="flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4  ">
                <PriceListSettings
                    isOpen={accordionStates.priceListSettings}
                    toggleAccordion={() => toggleAccordion("priceListSettings")}
                />
                <FloorPremiums
                    isOpen={accordionStates.floorPremium}
                    toggleAccordion={() => toggleAccordion("floorPremium")}
                    propertyData={propertyData}
                />
                <AdditionalPremiums
                    isOpen={accordionStates.additionalPremiums}
                    toggleAccordion={() =>
                        toggleAccordion("additionalPremiums")
                    }
                    propertyData={propertyData}
                />
                <PriceVersions
                    isOpen={accordionStates.priceVersions}
                    toggleAccordion={() => toggleAccordion("priceVersions")}
                    priceListMasterData={data}
                    action={action}
                />

                <ReviewsandApprovalRouting
                    isOpen={accordionStates.reviewAndApprovalSetting}
                    toggleAccordion={() =>
                        toggleAccordion("reviewAndApprovalSetting")
                    }
                />
            </div>
            {/* <div>
                <AddPropertyModal modalRef={modalRef} />
            </div> */}
        </div>
    );
};

export default BasicPricing;
