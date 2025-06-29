
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { priceListMasterService } from "@/component/servicesApi/apiCalls/propertyPricing/priceListMaster/priceListMasterService"; 

export const usePropertyPricing = (
    user,
    data,
    formatPayload,
    pricingData,
    resetPricingData,
    showToast,
    fetchPropertyListMasters,
    checkExistingUnits
) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState({});

    /*
     * Payload object for submission with the provided status.
     * The payload includes employee ID, tower phase ID, price list settings, payment scheme, and the specified status.
     * @param {*} status
     * @returns
     */
    const buildSubmissionPayload = (status) => ({
        emp_id: user?.id,
        property_masters_id:
            data?.property_commercial_detail?.property_master_id,
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
        reviewedByEmployeesPayload: pricingData?.reviewedByEmployees,
        approvedByEmployeesPayload: pricingData?.approvedByEmployees,
        status: status,
    });
 
    /*
     * Handles in submitting all data in creating price master list
     */
    const handleSubmit = async (
        e,
        status,
        action,
        excelId,
        setFloorPremiumsAccordionOpen
    ) => {
        e.preventDefault();
        if (action === "Edit") {
            try {
                setIsLoading((prev) => ({ ...prev, [status]: true }));
                const payload = buildSubmissionPayload(status);
                console.log("payload", payload);
                const response =
                    await priceListMasterService.updatePriceListMasters(
                        payload
                    );

                if (response?.status === 201 || response?.status === 200) {
                    showToast(
                        response?.data?.message || "Data updated successfully",
                        "success"
                    );

                    await checkExistingUnits(
                        data.tower_phase_id,
                        excelId || data?.excelId,
                        true
                    );
                    await fetchPropertyListMasters(true, true);

                    setTimeout(() => {
                        navigate("/property-pricing/master-lists");
                    }, 1000);
                    setFloorPremiumsAccordionOpen(false);
                } else {
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

                const response =
                    await priceListMasterService.storePriceListMasters(payload);

                if (response?.status === 201 || response?.status === 200) {
                    showToast(
                        response?.data?.message || "Data added successfully",
                        "success"
                    );

                    resetPricingData();
                    await checkExistingUnits(
                        data.tower_phase_id,
                        excelId || data?.excelId,
                        true
                    );
                    await fetchPropertyListMasters(true, true);

                    setTimeout(() => {
                        navigate("/property-pricing/master-lists");
                    }, 1000);
                    setFloorPremiumsAccordionOpen(false);
                } else {
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

    return {
        isLoading,
        buildSubmissionPayload,
        handleSubmit,
    };
};
