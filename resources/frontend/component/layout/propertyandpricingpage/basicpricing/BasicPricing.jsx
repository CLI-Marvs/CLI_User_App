import React, { useEffect, useRef, useState } from "react";
import ProjectDetails from "./ProjectDetails";
import PriceListSettings from "./accordion/PriceListSettings";
import AdditionalPremiums from "./accordion/AdditionalPremiums";
import PriceVersions from "./accordion/PriceVersions";
import PaymentSchemes from "./accordion/PaymentSchemes";
import moment from "moment";
import ReviewsandApprovalRouting from "./accordion/ReviewsandApprovalRouting";
import FloorPremiums from "./accordion/FloorPremiums";
import { Form, useLocation } from "react-router-dom";
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
import paymentScheme from "./accordion/PaymentSchemes";
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
    const [propertyData, setPropertyData] = useState(data);
    const [fileName, setFileName] = useState("");
    const [fileSelected, setFileSelected] = useState({});
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);
    const { pricingData, resetPricingData, setPricingData } = usePricing();
    const { fetchPropertyListMasters } = usePriceListMaster();
    const [isLoading, setIsLoading] = useState({});

    //Hooks
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
        }
    }, [data]);

    //Event handler
    // Open the add property modal
    const handleOpenAddPropertyModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    //Open the unit upload modal
    const handleOpenUnitUploadModal = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    console.log("Pricing Data", pricingData);
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
        status: status,
    });
    /**
     * Handles in submitting all data in creating price master list
     */
    const handleSubmit = async (e, status) => {
        e.preventDefault();
        // if (pricingData.priceListSettings.base_price === "" ||
        //     pricingData.priceListSettings.reservation_fee === "") {
        //     showToast("Please fill all the fields in the price list settings section", "error");
        //     return;
        // }
        // if (pricingData.paymentSchemes.length === 0) {
        //     showToast("Please select at least one payment scheme", "error");
        //     return;
        // }

        if (action === "Edit") {
            try {
                setIsLoading((prev) => ({ ...prev, [status]: true }));
                const payload = buildSubmissionPayload(status);
                console.log("Edit Payload", payload);
                console.log("Edit Payload", JSON.stringify(payload));

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
                        <span>{data?.price_list_master_id}</span>
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
            {/* ------------------------- */}

            <div className="flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4  ">
                <PriceListSettings />
                <FloorPremiums />
                <AdditionalPremiums />
                <PriceVersions priceListMasterData={data} action={action} />
                {/* <PaymentSchemes action={action} priceListMasterData={data} /> */}
                <ReviewsandApprovalRouting />
            </div>
            {/* <div>
                <AddPropertyModal modalRef={modalRef} />
            </div> */}
        </div>
    );
};

export default BasicPricing;
