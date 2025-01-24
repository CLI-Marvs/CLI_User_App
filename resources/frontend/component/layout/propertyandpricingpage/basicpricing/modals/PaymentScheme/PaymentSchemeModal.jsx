import React, { useEffect, useState } from 'react'
import { usePaymentScheme } from "@/context/PropertyPricing/PaymentSchemeContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
const PaymentSchemeModal = ({ paymentSchemeModalRef, priceListMasterData, action }) => {
    //States
    const { paymentScheme, fetchPaymentSchemes } = usePaymentScheme();
    const [selectedSchemes, setSelectedSchemes] = useState([]);
    const { updatePricingSection } = usePricing();

    //Hooks
    useEffect(() => {
        fetchPaymentSchemes();
    }, []);


    useEffect(() => {
        if (priceListMasterData || action === 'Edit') {
            if (priceListMasterData?.payment_scheme) {
                setSelectedSchemes(prev => ({
                    ...prev,
                    paymentSchemes: Array.isArray(priceListMasterData.payment_scheme)
                        ? priceListMasterData.payment_scheme.map(scheme => scheme.id)
                        : [priceListMasterData.payment_scheme.id],
                }));
            }
        }
    }, [priceListMasterData, action]);


    //Event handler
    const handleCancel = () => {
        paymentSchemeModalRef.current.close();
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
    const handleSelectedPaymentScheme = (e, schemeId) => {
        //TODO: to clarify here, if already selected, naa ba freedom si user nga iya e uncheck
        const isChecked = e.target.checked;
        if (action === 'Edit') {
            setSelectedSchemes((prevSchemes) => {
                // Ensure paymentSchemes is an array
                const paymentSchemes = Array.isArray(prevSchemes?.paymentSchemes)
                    ? prevSchemes.paymentSchemes
                    : [];

                const isSelected = paymentSchemes.includes(schemeId);

                // Update the paymentSchemes array
                const updatedPaymentSchemes = isSelected
                    ? paymentSchemes.filter((id) => id !== schemeId)
                    : [...paymentSchemes, schemeId];

                // Update pricingData directly as an array of IDs
                updatePricingSection('paymentSchemes', updatedPaymentSchemes);

                return {
                    ...prevSchemes,
                    paymentSchemes: updatedPaymentSchemes, // Ensure array structure
                };
            });
        }
        else {
            setSelectedSchemes(prevSchemes => {
                // If selectedSchemes is undefined or null, default to an empty array
                const schemes = prevSchemes || [];

                // Check if the schemeId already exists in the array
                const isAlreadySelected = schemes.includes(schemeId);
                const newSchemes = isChecked && !isAlreadySelected
                    ? [...schemes, schemeId]
                    : schemes.filter(id => id !== schemeId);

                updatePricingSection('paymentSchemes', { selectedSchemes: newSchemes });
                return newSchemes;
            });
        }
    };

    //Render function
    const renderPaymentSchemes = () => {
        if (paymentScheme && Array.isArray(paymentScheme)) {
            return paymentScheme.map((item, index) => {
                const paymentSchemesArray = action === 'Edit'
                    ? selectedSchemes?.paymentSchemes || [] // For Edit, extract paymentSchemes
                    : Array.isArray(selectedSchemes)
                        ? selectedSchemes // For Add, selectedSchemes is already an array
                        : [];
                const isChecked = paymentSchemesArray.includes(item.id);

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
                                    handleSelectedPaymentScheme(e, item.id)
                                }
                            />
                            <p className="montserrat-semibold text-[21px]">
                                {item?.payment_scheme_name} ID: {item?.id}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1 text-sm pr-4">
                            <p>
                                {item?.description}
                            </p>
                            <p>
                                Spot {item?.spot}%
                            </p>
                            <p>
                                Installment{" "}
                                {item?.downpayment_installment}%
                            </p>
                            <p>
                                Bank Financing{" "}
                                {item?.bank_financing}%
                            </p>
                            <p>Discount 8% (100% LP - RF)</p>
                        </div>
                    </div>
                );
            });
        }
    }
    return (
        <dialog
            id="Resolved"
            className="modal w-[900px] rounded-[10px] shadow-custom5 backdrop:bg-black/50  "
            ref={paymentSchemeModalRef}
        >
            <div className=" px-[25px] rounded-lg  overflow-hidden">
                <div className="p-[20px] flex flex-wrap justify-center gap-[20px]">
                    {renderPaymentSchemes()}
                </div>

                <div className="mt-5 mb-[25px] mr-7">
                    <div className="flex justify-end gap-[19px]">
                        <button className="gradient-btn5 p-[1px] w-[92px] h-[35px] rounded-[10px]" onClick={handleCancel}>
                            <div className="w-full h-full rounded-[9px] bg-white flex justify-center items-center montserrat-semibold text-sm">
                                <p className="text-base font-bold bg-gradient-to-r from-custom-bluegreen via-custom-solidgreen to-custom-solidgreen bg-clip-text text-transparent">
                                    Cancel
                                </p>
                            </div>
                        </button>

                        <button
                            type="submit"
                            className={`h-[37px] w-[185px] text-white rounded-[10px] gradient-btn2 hover:shadow-custom4`}
                        >
                            <> Confirm </>
                        </button>
                    </div>
                </div>

            </div>
        </dialog>
    )
}

export default PaymentSchemeModal
