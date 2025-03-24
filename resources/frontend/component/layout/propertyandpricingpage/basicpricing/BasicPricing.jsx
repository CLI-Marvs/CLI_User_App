import React, { useEffect, useState, useMemo } from "react";
import ProjectDetails from "./ProjectDetails";
import PriceListSettings from "./accordion/PriceListSettings";
import AdditionalPremiums from "./accordion/AdditionalPremiums";
import PriceVersions from "./accordion/PriceVersions";
import moment from "moment";
import ReviewsandApprovalRouting from "./accordion/ReviewsandApprovalRouting";
import FloorPremiums from "./accordion/FloorPremiums";
import { useLocation } from "react-router-dom";
import { useStateContext } from "../../../../context/contextprovider";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import { formatPayload } from "@/component/layout/propertyandpricingpage/utils/payloadFormatter";
import { showToast } from "@/util/toastUtil";
import { usePriceListMaster } from "@/context/PropertyPricing/PriceListMasterContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import CircularProgress from "@mui/material/CircularProgress";
import { usePropertyPricing } from "@/component/layout/propertyandpricingpage/hooks/usePropertyPricing";
import { useProperty } from "@/context/PropertyPricing/PropertyContext";
import UnitUploadButton from "@/component/layout/propertyandpricingpage/component/UnitUploadButton";
import generateBigIntId from "@/component/layout/propertyandpricingpage/utils/generateId";
import {
    priceListInitialState,
    priceVersionInitialState,
} from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";

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
    const location = useLocation();
    const { priceListData = {}, action = null } = location.state || {};
    const { pricingData, resetPricingData, setPricingData } = usePricing();
    const { fetchData, setPriceListMasterId } = usePriceListMaster();
    const {
        fetchUnits,
        units,
        excelId,
     
        lastFetchedExcelId,
        setTowerPhaseId,

        updateUnitComputedPrices,
        setFloorPremiumsAccordionOpen,
        setExcelId,
    } = useUnit();
    const { setPropertyMasterId } = useProperty();
    const [accordionStates, setAccordionStates] = useState({
        priceListSettings: false,
        floorPremium: false,
        additionalPremiums: false,
        priceVersions: false,
        reviewAndApprovalSetting: false,
    });
    const { isLoading, handleSubmit } = usePropertyPricing(
        user,
        priceListData,
        formatPayload,
        pricingData,
        resetPricingData,
        showToast,
        fetchData,
        fetchUnits
    );

    //Hooks
    /**
     * Hook to update pricing data based on incoming 'data' prop.
     * It sets propertyData, updates priceListSettings, priceVersions, floorPremiums, and additionalPremiums within the pricingData state.
     * It handles data transformations, particularly for floorPremiums (reducing to an object keyed by floor) and additionalPremiums (converting premiumCost to a number).
     * It also provides default values for priceVersions if none are available in the incoming data.  Uses moment.js for date formatting.
     */
    useEffect(() => {
        if (priceListData) {
            setTowerPhaseId(priceListData?.data?.tower_phases[0]?.id);
            setExcelId(priceListData?.data?.excel_id || null);
            setPropertyMasterId(
                priceListData?.data?.property_commercial_detail
                    ?.property_master_id
            );
            setPriceListMasterId(
                priceListData?.data?.price_list_master_id ||
                    priceListData?.data.property_commercial_detail
                        ?.price_list_master_id
            );

            // Update the priceListSettings
            if (priceListData?.data?.pricebasic_details) {
                setPricingData((prev) => ({
                    ...prev,
                    priceListSettings: {
                        ...prev.priceListSettings, // ✅ Use correct previous state key
                        ...priceListData.data.pricebasic_details,
                    },
                }));
            } else {
                setPricingData((prev) => ({
                    ...prev,
                    priceListSettings: priceListInitialState,
                }));
            }

            // Update the price versions
            if (priceListData?.data?.price_versions) {
                setPricingData((prev) => ({
                    ...prev,
                    priceVersions: priceListData.data?.price_versions.length
                        ? priceListData.data?.price_versions.map((version) => ({
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
                                  percent_increase: 0,
                                  no_of_allowed_buyers: 0,
                                  status: "Active",
                                  expiry_date: "N/A",
                                  payment_scheme: [],
                              },
                          ],
                }));
            } else {
                setPricingData((prev) => ({
                    ...prev,
                    priceVersions: priceVersionInitialState,
                }));
            }

            // Update the floor premiums
            if (
                priceListData?.data?.floor_premiums &&
                priceListData?.data?.floor_premiums.length > 0
            ) {
                const floorPremiumData =
                    priceListData?.data?.floor_premiums.reduce(
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
                priceListData?.data?.additional_premiums &&
                priceListData?.data?.additional_premiums.length > 0
            ) {
                const updatedPremiums =
                    priceListData?.data?.additional_premiums.map((item) => ({
                        ...item,
                        premiumCost:
                            item.premiumCost === "0.00" ||
                            item.premiumCost === 0
                                ? 0
                                : item.premiumCost,
                    }));

                setPricingData((prev) => ({
                    ...prev,
                    additionalPremiums: updatedPremiums,
                }));
            }

            // Update the reviewedByEmployees
            if (
                priceListData?.data?.reviewedByEmployees &&
                priceListData?.data?.reviewedByEmployees.length > 0
            ) {
                setPricingData((prev) => ({
                    ...prev,
                    reviewedByEmployees:
                        priceListData?.data.reviewedByEmployees,
                }));
            } else {
                setPricingData((prev) => ({
                    ...prev,
                    reviewedByEmployees: [],
                }));
            }

            // Update the approvedByEmployees
            if (
                priceListData?.data?.approvedByEmployees &&
                priceListData?.data?.approvedByEmployees.length > 0
            ) {
                setPricingData((prev) => ({
                    ...prev,
                    approvedByEmployees:
                        priceListData.data?.approvedByEmployees,
                }));
            } else {
                setPricingData((prev) => ({
                    ...prev,
                    approvedByEmployees: [],
                }));
            }
        }
    }, [priceListData.data]);

    /**
     * Hook to handle fetching and clearing of floor and pricing data based on the excel_id.
     * It clears existing data if excel_id is null and fetches new data if the excel_id is valid and different from the last fetched ID.
     * It also handles setting the additionalPremiums if it's currently empty.
     */
    useEffect(() => {
        if (!!excelId || !!priceListData?.data.excel_id) {
            setPricingData((prev) => ({
                ...prev,
                additionalPremiums: prev.additionalPremiums.length
                    ? prev.additionalPremiums
                    : additionalPremiums.map((item) => {
                          const generatedId = generateBigIntId();
                          if (!isNaN(Number(generatedId))) {
                              return {
                                  ...item,
                                  id: parseInt(generatedId),
                              };
                          } else {
                              return {
                                  ...item,
                                  id: null,
                              };
                          }
                      }),
            }));
        } else {
            setPricingData((prev) => ({
                ...prev,
                floorPremiums: [],
                additionalPremiums: [],
            }));
        }
    }, [
        excelId,
        priceListData?.data.excel_id,
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
            // Check if the unit is excluded from the floor premium
            const isUnitExcluded =
                floorPremium?.excludedUnits?.some(
                    (excludedId) => excludedId === unit.id
                ) || false;

            const floorPremiumCost =
                floorPremium && !isUnitExcluded
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
                    pricingData?.additionalPremiums?.filter((additionalPrem) =>
                        (Array.isArray(selectedPremiumId)
                            ? selectedPremiumId
                            : [selectedPremiumId]
                        ).includes(additionalPrem.id)
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
        // // console.log("name", name);
        // if (name === "floorPremium") {
        //     setFloorPremiumsAccordionOpen((prev) => prev);
        // }
    };

    //Handle price list submit
    const handleFormSubmit = (e, status) => {
        handleSubmit(e, status, action, excelId, setFloorPremiumsAccordionOpen);
    };

    return (
        <div className="h-screen max-w-[957px] min-w-[897px] bg-custom-grayFA px-[30px] ">
            {priceListData && Object.keys(priceListData).length > 0 && (
                <ProjectDetails priceListData={priceListData} />
            )}

            {priceListData && priceListData.data.status === "Draft" && (
                <div className="flex gap-[15px] py-5">
                    <UnitUploadButton
                        buttonText={
                            excelId
                                ? "Change Uploaded Units"
                                : "Upload Unit Details"
                        }
                        className={`h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 ${
                            isLoading["On-going Approval"]
                                ? "cursor-not-allowed opacity-50"
                                : ""
                        }`}
                        propertyData={priceListData}
                        setAccordionStates={setAccordionStates}
                    />

                    <button
                        className={`h-[37px] w-[176px] rounded-[10px] text-white montserrat-semibold text-sm gradient-btn2 hover:shadow-custom4 ${
                            isLoading["On-going Approval"]
                                ? "cursor-not-allowed opacity-50"
                                : ""
                        }`}
                        type="submit"
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
            )}

            <div className="flex flex-col gap-1 w-full border-t-1 border-custom-lightestgreen py-4  ">
                <PriceListSettings
                    isOpen={accordionStates.priceListSettings}
                    toggleAccordion={() => toggleAccordion("priceListSettings")}
                    priceListData={priceListData}
                />
                <FloorPremiums
                    isOpen={accordionStates.floorPremium}
                    toggleAccordion={() => toggleAccordion("floorPremium")}
                    priceListData={priceListData}
                />
                <AdditionalPremiums
                    isOpen={accordionStates.additionalPremiums}
                    toggleAccordion={() =>
                        toggleAccordion("additionalPremiums")
                    }
                    priceListData={priceListData}
                />
                <PriceVersions
                    isOpen={accordionStates.priceVersions}
                    toggleAccordion={() => toggleAccordion("priceVersions")}
                    priceListData={priceListData}
                    action={action}
                />

                <ReviewsandApprovalRouting
                    action={action}
                    priceListData={priceListData}
                    data={priceListData}
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
