import React, { useState, useEffect } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";

const EditPaymentSchemeModal = ({
    editPaymentSchemeModalRef,
    versionIndex,
}) => {
    const [selectedPaymentSchemes, setSelectedPaymentSchemes] = useState([]);
    const { updatePricingSection, pricingData } = usePricing();
    const { paymentScheme } = usePaymentScheme();
    console.log("selectedPaymentSchemes", selectedPaymentSchemes);
    //Hooks
    /**
     * This effect is triggered when the versionIndex changes
     * It retrieves the IDs of the payment schemes from the specific version
     * and filters the payment schemes based on matching IDs
     *
     */
    useEffect(() => {
        if (
            versionIndex !== undefined &&
            paymentScheme !== undefined &&
            pricingData !== undefined
        ) {
            const currentPaymentSchemeIds =
                pricingData?.priceVersions?.[versionIndex]?.payment_scheme ||
                [];
            const selectedPaymentSchemes = paymentScheme.filter((scheme) =>
                currentPaymentSchemeIds.some((item) => item.id === scheme.id)
            );
            setSelectedPaymentSchemes(selectedPaymentSchemes);
        }
    }, [paymentScheme, versionIndex, pricingData]);

    //Event handler

    //Confirm the payment scheme selected
    const handleConfirm = () => {
        console.log("add payment scheme");
        const updatedPriceVersions = Object.entries(
            pricingData?.priceVersions || {}
        ).map(([key, version], index) =>
            index === versionIndex
                ? {
                      ...version,
                      payment_scheme: selectedPaymentSchemes,
                  }
                : version
        );
        console.log("updatedPriceVersions", updatedPriceVersions);
        // Convert back to object format after updating
        const updatedPriceVersionsObject = Object.fromEntries(
            Object.keys(pricingData?.priceVersions || {}).map((key, index) => [
                key,
                updatedPriceVersions[index],
            ])
        );

        updatePricingSection("priceVersions", updatedPriceVersionsObject);
        if (editPaymentSchemeModalRef.current) {
            editPaymentSchemeModalRef.current.close();
        }
    };

    //Handle the selection of payment schemes by adding or removing the selected scheme ID.
    const handleSelectedPaymentScheme = (e, item) => {
        const schemeId = item?.id;
        setSelectedPaymentSchemes((prevSchemes) => {
            // If selectedSchemes is undefined or null, default to an empty array
            const schemes = prevSchemes || [];

            // Check if the schemeId already exists in the array
            const isSelected = schemes.some((scheme) => scheme.id === schemeId);

            const updatedPaymentSchemes = isSelected
                ? schemes.filter((scheme) => scheme.id !== schemeId) // Remove the selected scheme
                : [
                      ...schemes,
                      {
                          id: schemeId,
                          payment_scheme_name: item.payment_scheme_name,
                      },
                  ]; // Add the new scheme as an object
            return updatedPaymentSchemes;
        });
    };

    //Handle to cancel the modal
    const handleCancel = () => {
        editPaymentSchemeModalRef.current.close();
    };

    //Render function
    const renderPaymentSchemes = () => {
        if (paymentScheme && Array.isArray(paymentScheme)) {
            return paymentScheme.map((item, index) => {
                const paymentSchemesArray = selectedPaymentSchemes || []; // Use selectedPaymentSchemes or default to empty array

                const isChecked = paymentSchemesArray.some(
                    (scheme) => scheme.id === item.id
                );

                return (
                    <div
                        className="w-[calc(33.33%-20px)] h-[259px] p-[20px] bg-[#F7F7F7]  rounded-[10px]"
                        key={index}
                    >
                        <div className="flex items-center gap-[15px] h-[36px] w-full mb-[10px]  ">
                            <input
                                checked={isChecked}
                                type="checkbox"
                                className="h-[16px] w-[16px]  rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                onChange={(e) =>
                                    handleSelectedPaymentScheme(e, item)
                                }
                            />
                            <p className="montserrat-semibold text-[21px]">
                                {item?.payment_scheme_name} ID: {item?.id}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 text-sm pr-4">
                            <p>{item?.description}</p>
                            <p>Spot {item?.spot}%</p>
                            <p>Installment {item?.downpayment_installment}%</p>
                            <p>Bank Financing {item?.bank_financing}%</p>
                            <p>Discount 8% (100% LP - RF)</p>
                        </div>
                    </div>
                );
            });
        }
    };
    return (
        <dialog
            className="modal w-[900px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={editPaymentSchemeModalRef}
        >
            <div className=" px-[25px] rounded-lg  overflow-hidden">
                <div className="p-[20px] flex flex-wrap justify-center gap-[20px]">
                    {renderPaymentSchemes()}
                </div>

                <div className="mt-5 mb-[25px] mr-7">
                    <div className="flex justify-end gap-[19px]">
                        <button
                            className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]"
                            onClick={handleCancel}
                        >
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>

                        <button
                            type="submit"
                            onClick={handleConfirm}
                            className={`h-[37px] w-[185px] text-white rounded-[10px] gradient-btn2 hover:shadow-custom4`}
                        >
                            <> Confirm </>
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default EditPaymentSchemeModal;
