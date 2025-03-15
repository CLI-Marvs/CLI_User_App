import React, { useEffect, useState } from "react";
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
const AddPaymentSchemeModal = ({
    addPaymentSchemeModalRef,
    priceListData,
    action,
    versionIndex,
}) => {
    //States
    const { paymentScheme, fetchPaymentSchemes } = usePaymentScheme();
    const [selectedSchemes, setSelectedSchemes] = useState([]);
    const { pricingData, setPricingData } = usePricing();
    const isDisabled =
        !selectedSchemes ||
        selectedSchemes.length === 0 ||
        (Array.isArray(selectedSchemes?.paymentSchemes) &&
            selectedSchemes.paymentSchemes.length === 0);

    //Hooks
    useEffect(() => {
        fetchPaymentSchemes();
    }, []);

    useEffect(() => {
        if (priceListData || action === "Edit") {
            if (priceListData?.data.payment_scheme) {
                setSelectedSchemes((prev) => ({
                    ...prev,
                    paymentSchemes: Array.isArray(
                        priceListData.data.payment_scheme
                    )
                        ? priceListData.data.payment_scheme.map(
                              (scheme) => scheme.id
                          )
                        : [priceListData.data.payment_scheme.id],
                }));
            }
        }
    }, [priceListData, action]);

    //Event handler
    const handleCancel = () => {
        setSelectedSchemes([]);
        addPaymentSchemeModalRef.current.close();
    };

    //Confirm the payment scheme selected
    const handleConfirm = () => {
        if (action === "Edit") {
            // When editing, we directly modify the array, no need to convert to object
            const updatedPriceVersions = pricingData?.priceVersions?.map(
                (version, index) =>
                    index === versionIndex
                        ? {
                              ...version,
                              payment_scheme: selectedSchemes?.paymentSchemes,
                          }
                        : version
            );
            setPricingData((prev) => ({
                ...prev,
                priceVersions: updatedPriceVersions,
            }));
            if (addPaymentSchemeModalRef.current) {
                setSelectedSchemes(null);
                addPaymentSchemeModalRef.current.close();
            }
        } else {
            // In the else block (for adding a version)
            const updatedPriceVersions = pricingData?.priceVersions?.map(
                (version, index) =>
                    index === versionIndex
                        ? {
                              ...version,
                              payment_scheme: selectedSchemes,
                          }
                        : version
            );
            setPricingData((prev) => ({
                ...prev,
                priceVersions: updatedPriceVersions,
            }));
            if (addPaymentSchemeModalRef.current) {
                setSelectedSchemes(null);
                addPaymentSchemeModalRef.current.close();
            }
        }
    };

    //Event Handler
    /**
     * Handle the selection of payment schemes by adding or removing the selected scheme ID.
     * - In 'Edit' mode: Update the `paymentSchemes` array within `selectedSchemes`.
     * - In 'Add' mode: Update `selectedSchemes` directly as a flat array.
     *
     * @param {Object} e - The event object from the checkbox input.
     * @param {number} schemeId - The ID of the payment scheme being selected/unselected.
     */
    const handleSelectedPaymentScheme = (e, item) => {
        const schemeId = item?.id;
        if (action === "Edit") {
            console.log(" Action is Edit");
            setSelectedSchemes((prevSchemes) => {
                // Ensure paymentSchemes is an array
                const paymentSchemes = Array.isArray(
                    prevSchemes?.paymentSchemes
                )
                    ? prevSchemes.paymentSchemes
                    : [];

                // Check if the scheme is already selected
                const isSelected = paymentSchemes.some(
                    (scheme) => scheme.id === schemeId
                );

                // Toggle logic: If selected, remove it; if not, add it
                const updatedPaymentSchemes = isSelected
                    ? paymentSchemes.filter((scheme) => scheme.id !== schemeId) // Remove the selected scheme
                    : [
                          ...paymentSchemes,
                          {
                              id: schemeId,
                              payment_scheme_name: item.payment_scheme_name,
                          },
                      ]; // Add the new scheme as an object

                return {
                    ...prevSchemes,
                    paymentSchemes: updatedPaymentSchemes,
                };
            });
        } else {
            console.log("it runs here in Add");
            setSelectedSchemes((prevSchemes) => {
                // If selectedSchemes is undefined or null, default to an empty array
                const schemes = prevSchemes || [];

                // Check if the schemeId already exists in the array
                const isSelected = schemes.some(
                    (scheme) => scheme.id === schemeId
                );

                const updatedPaymentSchemes = isSelected
                    ? schemes.filter((scheme) => scheme.id !== schemeId) // Remove the selected scheme
                    : [
                          ...schemes,
                          {
                              id: schemeId,
                              payment_scheme_name: item.payment_scheme_name,
                          },
                      ];
                return updatedPaymentSchemes;
            });
        }
    };

    //Render function
    const renderPaymentSchemes = () => {
        if (paymentScheme && Array.isArray(paymentScheme)) {
            return paymentScheme.map((item, index) => {
                const paymentSchemesArray =
                    action === "Edit"
                        ? selectedSchemes?.paymentSchemes || []
                        : Array.isArray(selectedSchemes)
                        ? selectedSchemes
                        : [];
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
                                {item?.payment_scheme_name}
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
            id="Resolved"
            className="modal w-[900px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={addPaymentSchemeModalRef}
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
                            disabled={isDisabled}
                            onClick={handleConfirm}
                            className={`h-[37px] w-[185px] text-white rounded-[10px] gradient-btn2 hover:shadow-custom4 ${
                                isDisabled
                                    ? "cursor-not-allowed opacity-60"
                                    : ""
                            }`}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default AddPaymentSchemeModal;
