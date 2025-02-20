import React, { useState, useEffect } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const PremiumChecklistModal = ({ modalRef2, selectedUnit }) => {
    //States
    const { pricingData, setPricingData } = usePricing();
    const [selectedAdditionalPremiums, setSelectedAdditionalPremiums] =
        useState([]);
    const [initialAdditionalPremiums, setInitialAdditionalPremiums] = useState(
        []
    );
    
    //Hooks
    useEffect(() => {
        if (selectedUnit) {
            const hasPremiums =
                selectedUnit.additional_premium_id &&
                selectedUnit.additional_premium_id.length > 0;
            setInitialAdditionalPremiums(
                selectedUnit.additional_premium_id ?? []
            );
            setSelectedAdditionalPremiums([
                {
                    unit: selectedUnit.unit_name,
                    unit_id: selectedUnit.unit_id,
                    additional_premium_id:
                        selectedUnit.additional_premium_id ?? [],
                    fromDatabase: hasPremiums,
                },
            ]);
        }
    }, [selectedUnit]);

    //Event handler
    /**
     * Updates the selected additional premiums when a checkbox is toggled.
     * If checked, the premium ID is added to the unit's `additional_premium_id` array.
     * If unchecked, the premium ID is removed from the array.
     * Ensures that each unit maintains a unique set of additional premiums.
     */
    const handleCheckboxChange = (e, premium) => {
        const isChecked = e.target.checked;

        setSelectedAdditionalPremiums((prevState) => {
            return prevState.map((item) =>
                item.unit_id === selectedUnit?.unit_id
                    ? {
                          ...item,
                          additional_premium_id: isChecked
                              ? [
                                    ...new Set([
                                        ...item.additional_premium_id,
                                        premium.id,
                                    ]),
                                ]
                              : item.additional_premium_id.filter(
                                    (id) => id !== premium.id
                                ),
                      }
                    : item
            );
        });
    };

    /**
     * Updates the selected additional premiums in `pricingData`.
     * Merges the newly selected premiums with existing ones.
     * If a unit already exists, its `additional_premium_id` is updated.
     * If a unit is newly selected, it is added to the list.
     * Removes units with an empty `additional_premium_id` unless they came from the database.
     * Closes the modal after applying the changes.
     */
    const handleApplyPremiums = () => {
        setPricingData((prevState) => {
            const existingPremiums = prevState.selectedAdditionalPremiums || [];

            const updatedPremiums = [...existingPremiums];

            selectedAdditionalPremiums.forEach((newItem) => {
                const existingIndex = updatedPremiums.findIndex(
                    (item) => item.unit_id === newItem.unit_id
                );

                if (existingIndex !== -1) {
                    updatedPremiums[existingIndex] = {
                        ...updatedPremiums[existingIndex],
                        additional_premium_id: newItem.additional_premium_id,
                    };
                } else {
                    updatedPremiums.push(newItem);
                }
            });

            const filteredPremiums = updatedPremiums.filter(
                (item) =>
                    item.additional_premium_id.length > 0 ||
                    item.fromDatabase === true
            );
            return {
                ...prevState,
                selectedAdditionalPremiums: filteredPremiums,
            };
        });
        if (modalRef2.current) {
            modalRef2.current.close();
        }
    };

    //Handle close the modal
    const handleCloseModal = () => {
        if (modalRef2.current) {
            // setSelectedAdditionalPremiums([]);
            modalRef2.current.close();
        }
    };

    /**
     * Checks if the selected additional premiums have changed from their initial values.
     * This function compares the selected unit's additional premiums with their initial values.
     * It returns true if the selected premiums are different from the original, and false otherwise.
     */
    const hasChanges = () => {
        // Find the selected unit in selectedAdditionalPremiums
        const selectedUnitPremiums =
            selectedAdditionalPremiums.find(
                (item) => item.unit_id === selectedUnit?.unit_id
            )?.additional_premium_id ?? [];

        // Compare arrays: Check if selected premiums are different from the original
        return (
            JSON.stringify(selectedUnitPremiums.sort()) !==
            JSON.stringify(initialAdditionalPremiums.sort())
        );
    };

    return (
        <dialog
            className="modal w-[385px] rounded-lg bg-white backdrop:bg-black/50"
            ref={modalRef2}
        >
            <div className=" px-[50px] mb-5 rounded-[10px]">
                <div className="">
                    <div
                        method="dialog"
                        className="pt-2 flex justify-end -mr-[45px]"
                    >
                        <button
                            className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex justify-start gap-[10px] mb-[10px] items-center mt-1">
                    <p className="font-semibold text-sm text-custom-gray81">
                        Add premum to unit
                    </p>
                    <p className="font-semibold">
                        {selectedUnit && selectedUnit?.unit_name}
                    </p>
                </div>
                <div className="flex flex-col gap-[10px]">
                    {pricingData &&
                        pricingData.additionalPremiums.length > 0 &&
                        pricingData.additionalPremiums.map((premium, index) => {
                            return (
                                <div
                                    key={index}
                                    className="h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]"
                                >
                                    <input
                                        onChange={(e) =>
                                            handleCheckboxChange(e, premium)
                                        }
                                        checked={selectedAdditionalPremiums.some(
                                            (item) =>
                                                item.unit_id ===
                                                    selectedUnit?.unit_id &&
                                                item.additional_premium_id.includes(
                                                    premium.id
                                                )
                                        )}
                                        type="checkbox"
                                        className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                    />
                                    <p>
                                        {premium.viewName}  
                                    </p>
                                </div>
                            );
                        })}
                </div>
                <div className="flex justify-start mt-4 mb-8">
                    <button
                        disabled={!hasChanges()}
                        className={`w-[151px] h-[37px] text-white montserrat-semibold text-sm gradient-btn5 rounded-[10px] hover:shadow-custom4 ${
                            !hasChanges() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={handleApplyPremiums}
                    >
                        Apply Premiums
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default PremiumChecklistModal;
