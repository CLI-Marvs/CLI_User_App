import React, { useEffect, useRef, useState, useMemo } from "react";
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
import expectedHeaders from "@/constant/data/excelHeader";
import * as XLSX from "xlsx";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { formatPayload } from "@/component/layout/propertyandpricingpage/basicpricing/utils/payloadFormatter";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import CircularProgress from "@mui/material/CircularProgress";
import { usePropertyPricing } from "@/component/layout/propertyandpricingpage/basicpricing/hooks/usePropertyPricing";

const additionalPremiums = [
    {
        viewName: "Sea View",
        premiumCost: 0,
        excludedUnitIds: [],
    },
    {
        viewName: "Mountain View",
        premiumCost: 0,
        excludedUnitIds: [],
    },
    {
        viewName: "City View",
        premiumCost: 0,
        excludedUnitIds: [],
    },
    {
        viewName: "Amenity View",
        premiumCost: 0,
        excludedUnitIds: [],
    },
];

const BasicPricing = () => {
    //State
    const { user } = useStateContext();
    const modalRef = useRef(null);
    const uploadUnitModalRef = useRef(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const { data = {}, action = null } = location.state || {};
    const [propertyData, setPropertyData] = useState();
    const [fileName, setFileName] = useState("");
    const [excelDataRows, setExcelDataRows] = useState([]);
    const [selectedExcelHeader, setSelectedExcelHeader] = useState([]);
    const { pricingData, resetPricingData, setPricingData } = usePricing();
    const { fetchPropertyListMasters } = usePriceListMaster();
    const {
        checkExistingUnits,
        floors,
        units,
        setUnits,
        setFloors,
        setFloorPremiumsAccordionOpen,
        excelId,
        lastFetchedExcelId,
        setLastFetchedExcelId,
        setTowerPhaseId,
        setExcelIdFromPriceList,
        updateUnitComputedPrices,
        computedUnitPrices,
        saveComputedUnitPricingData,
    } = useUnit();
    const [accordionStates, setAccordionStates] = useState({
        priceListSettings: false,
        floorPremium: false,
        additionalPremiums: false,
        priceVersions: false,
        reviewAndApprovalSetting: false,
    });
    const [
        isReviewAndApprovalAccordionOpen,
        setIsReviewAndApprovalAccordionOpen,
    ] = useState(false);
    const { isLoading, buildSubmissionPayload, handleSubmit } =
        usePropertyPricing(
            user,
            data,
            formatPayload,
            pricingData,
            resetPricingData,
            showToast,
            fetchPropertyListMasters,
            checkExistingUnits
        );

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
            setTowerPhaseId(
                data?.tower_phase_id || data?.data?.tower_phases[0]?.id
            );
            setExcelIdFromPriceList(data?.excel_id);
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
                              priority_number: version.priority_number,
                              name: version.version_name || "",
                              percent_increase: version.percent_increase || 0,
                              status: version.status,
                              no_of_allowed_buyers:
                                  version.no_of_allowed_buyers || 0,
                              expiry_date:
                                  version.expiry_date === null
                                      ? "N/A"
                                      : moment(version.expiry_date).format(
                                            "MM-DD-YYYY HH:mm:ss"
                                        ),
                              payment_scheme: version.payment_schemes || [],
                          }))
                        : [
                              {
                                  id: 0,
                                  priority_number: 1,
                                  name: "",
                                  percent_increase: "",
                                  no_of_allowed_buyers: "",
                                  status: "Active",
                                  expiry_date: "N/A",
                                  payment_scheme: [],
                              },
                          ],
                }));
            }

            // Update the floor premiums
            if (data?.floor_premiums && data?.floor_premiums.length > 0) {
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

            // Update the reviewedByEmployees
            if (
                data?.reviewedByEmployees &&
                data?.reviewedByEmployees.length > 0
            ) {
                setPricingData((prev) => ({
                    ...prev,
                    reviewedByEmployees: data.reviewedByEmployees,
                }));
            }

            // Update the approvedByEmployees
            if (
                data?.approvedByEmployees &&
                data?.approvedByEmployees.length > 0
            ) {
                setPricingData((prev) => ({
                    ...prev,
                    approvedByEmployees: data.approvedByEmployees,
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
        if (
            excelId &&
            data?.excel_id &&
            data?.excel_id !== lastFetchedExcelId
        ) {
            checkExistingUnits(data.tower_phase_id, data.excel_id);
            setLastFetchedExcelId(data?.excel_id);
        }

        if (excelId || data?.excel_id) {
            setPricingData((prev) => ({
                ...prev,
                additionalPremiums: prev.additionalPremiums.length
                    ? prev.additionalPremiums // Keep existing if not empty
                    : additionalPremiums.map((item) => {
                          const generatedId = generateBigIntId();
                          // Validate if the generated ID is numeric
                          if (!isNaN(Number(generatedId))) {
                              return {
                                  ...item,
                                  id: parseInt(generatedId), // Convert to integer if needed
                              };
                          } else {
                              // Handle the case where the ID is not numeric
                              console.error(
                                  "Generated ID is not numeric:",
                                  generatedId
                              );
                              return {
                                  ...item,
                                  id: null, // or some default value
                              };
                          }
                      }),
            }));
        }

        // Function to generate random Id
        const generateBigIntId = () => {
            return (
                BigInt(Date.now()) * BigInt(1000) +
                BigInt(Math.floor(Math.random() * 1000))
            ).toString();
        };
    }, [
        excelId,
        data?.excel_id,
        data?.tower_phase_id,
        additionalPremiums,
        lastFetchedExcelId,
    ]);

    useEffect(() => {
        return () => {
            setAccordionStates({
                priceListSettings: false,
                floorPremium: false,
                additionalPremiums: false,
                priceVersions: false,
                reviewAndApprovalSetting: false,
            });
        };
    }, [location]);

    //Compute the effective balcony base
    const computeEffectiveBalconyBase = useMemo(() => {
        const basePrice = pricingData.priceListSettings?.base_price;
        return basePrice ? basePrice * 0.5 : 0; // Compute 50%
    }, [pricingData.priceListSettings?.base_price]);

    //Compute the effective base price, effective balcony base, and transfer charge, vat, vatable list price, reservation fee, total contract price
    const computedEffectiveBasePrice = useMemo(() => {
        return units.map((unit) => {
            // Get Base Price
            const basePrice =
                parseFloat(pricingData.priceListSettings?.base_price) || 0;

            // Get Floor Premium for the unit’s floor
            const floorPremium = pricingData.floorPremiums[unit.floor];
            const floorPremiumCost = floorPremium
                ? parseFloat(floorPremium.premiumCost) || 0
                : 0;

            const additionalPremiumCost = [
                ...(pricingData.selectedAdditionalPremiums || []),
                ...(unit.additional_premium_id || []),
            ].reduce((total, selected) => {
                const selectedPremiumId =
                    selected.additional_premium_id || selected; // Handle both new selected and existing
                if (selected.unit && selected.unit !== unit.unit) return total;

                // Find all matching additional premiums
                const matchingPremiums =
                    pricingData?.additionalPremiums?.filter((ap) =>
                        (Array.isArray(selectedPremiumId)
                            ? selectedPremiumId
                            : [selectedPremiumId]
                        ).includes(ap.id)
                    ) || [];

                // Sum up all matching premium costs
                const premiumTotal = matchingPremiums.reduce(
                    (sum, premium) =>
                        sum + (parseFloat(premium.premiumCost) || 0),
                    0
                );

                return total + premiumTotal;
            }, 0);

            // Compute Effect base price
            const effective_base_price =
                basePrice + floorPremiumCost + additionalPremiumCost || 0;

            const effective_balcony_base =
                pricingData.priceListSettings?.effective_balcony_base || 0;

            // Compute List balcony_area
            const computed_list_price_with_vat = parseFloat(
                (
                    (unit.indoor_area || 0) * effective_base_price +
                    ((parseFloat(unit.balcony_area) || 0) +
                        (parseFloat(unit.garden_area) || 0)) *
                        effective_balcony_base
                ).toFixed(2)
            );

            //Compute transfer charge
            const transfer_charge =
                (computed_list_price_with_vat *
                    pricingData.priceListSettings?.transfer_charge) /
                100;

            // Define VAT percentage
            const vatRate = pricingData.priceListSettings?.vat || 12;

            // Compute VAT (only if LP + TC is greater than 3.6M)
            const listPricePlusTransferCharge =
                computed_list_price_with_vat + transfer_charge;
            const vatAmount =
                listPricePlusTransferCharge >
                pricingData.priceListSettings?.vatable_less_price
                    ? (listPricePlusTransferCharge * vatRate) / 100
                    : 0;

            // Compute Total Contract Price (TCP)
            const totalContractPrice = listPricePlusTransferCharge + vatAmount;

            return {
                ...unit,
                effective_base_price,
                computed_list_price_with_vat,
                computed_reservation_fee:
                    pricingData?.priceListSettings?.reservation_fee,
                computed_transfer_charge: parseFloat(
                    transfer_charge.toFixed(2)
                ),
                vatAmount: parseFloat(vatAmount.toFixed(2)),
                computed_total_contract_price: parseFloat(
                    totalContractPrice.toFixed(2)
                ),
            };
        });
    }, [
        units,
        pricingData.priceListSettings?.base_price,
        pricingData.priceListSettings?.effective_balcony_base,
        pricingData.priceListSettings?.transfer_charge,
        pricingData.priceListSettings?.vat,
        pricingData.priceListSettings?.vatable_less_price,
        pricingData.priceListSettings?.reservation_fee,
        pricingData.floorPremiums,
        pricingData.selectedAdditionalPremiums,
        pricingData.additionalPremiums,
    ]);

    useEffect(() => {
        setPricingData((prev) => ({
            ...prev,
            priceListSettings: {
                ...prev.priceListSettings,
                effective_balcony_base: computeEffectiveBalconyBase,
            },
        }));
    }, [computeEffectiveBalconyBase]);

    useEffect(() => {
        if (units.length > 0) {
            updateUnitComputedPrices(computedEffectiveBasePrice);
        }
    }, [computedEffectiveBasePrice, updateUnitComputedPrices]);

    //Event handler
    // Function to toggle a specific accordion
    const toggleAccordion = (name) => {
        setAccordionStates((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));

        // Handle review setting state
        if (name === "reviewAndApprovalSetting") {
            // If opening the review accordion, set to true
            if (!accordionStates.reviewAndApprovalSetting) {
                setIsReviewAndApprovalAccordionOpen(true);
            } else {
                // If closing the review accordion, set to false
                setIsReviewAndApprovalAccordionOpen(false);
            }
        }
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

    //Handle close the unit upload modal
    const handleClose = () => {
        // Reset file input field
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // Reset state variables
        setFileName("");

        // Close modal
        if (uploadUnitModalRef.current) {
            uploadUnitModalRef.current.close();
        }
    };

    /**
     * Handles the process of uploading an Excel file, extracting the headers
     */
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
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

            // Normalize empty values to `null` and Remove empty rows
            const normalizedDataRows = dataRows
                .map((row) =>
                    selectedHeaders.map((_, index) =>
                        row[index] !== undefined ? row[index] : null
                    )
                )
                .filter((row) => row.some((value) => value !== null)); // Remove completely empty rows

            setExcelDataRows(normalizedDataRows);

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
                showToast(
                    `Please check your Excel header row.\nMissing Headers: ${missingHeaders.join(
                        ", "
                    )}`,
                    "warning"
                );
                setSelectedExcelHeader([]);
                return;
            }

            // Notify user if extra headers are found, but continue with expected headers
            if (extraHeaders.length > 0) {
                showToast(
                    `Please check your Excel header row.\nExtra Headers: ${extraHeaders.join(
                        ", "
                    )}\nProcessing will continue with expected headers only.`,
                    "warning"
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

    //Handle price list submit
    const handleFormSubmit = (e, status) => {
        handleSubmit(e, status, action, excelId, setFloorPremiumsAccordionOpen);
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
                    onClick={(e) => handleFormSubmit(e, "On-going Approval")}
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
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <div>
                <UploadUnitDetailsModal
                    excelDataRows={excelDataRows}
                    onClose={handleClose}
                    propertyData={propertyData}
                    handleFileChange={handleFileChange}
                    uploadUnitModalRef={uploadUnitModalRef}
                    fileName={fileName}
                    selectedExcelHeader={selectedExcelHeader}
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
                    action={action}
                    propertyData={propertyData}
                    isReviewAndApprovalAccordionOpen={
                        isReviewAndApprovalAccordionOpen
                    }
                    data={data}
                    isOpen={accordionStates.reviewAndApprovalSetting}
                    toggleAccordion={() =>
                        toggleAccordion("reviewAndApprovalSetting")
                    }
                />
            </div>
        </div>
    );
};

export default BasicPricing;
