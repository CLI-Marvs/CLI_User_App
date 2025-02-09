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
    //    console.log("selectedAdditionalPremiums", selectedAdditionalPremiums);
    console.log("pricingData", pricingData);

    //Hooks
    useEffect(() => {
        if (selectedUnit) {
            setInitialAdditionalPremiums(
                selectedUnit.additional_premium_id ?? []
            );
            setSelectedAdditionalPremiums([
                {
                    unit: selectedUnit.unit_name,
                    unit_id: selectedUnit.unit_id,
                    additional_premium_id:
                        selectedUnit.additional_premium_id ?? [],
                },
            ]);
        }
    }, [selectedUnit]);

    //Event handler
    //Handle checkbox change
    // const handleCheckboxChange = (e, premium) => {
    //     setSelectedAdditionalPremiums((prevState) => {
    //         const existingUnit = prevState.find(
    //             (item) => item.unit_id === selectedUnit?.unit_id
    //         );

    //         let updatedPremiums;

    //         if (e.target.checked) {
    //             if (existingUnit) {
    //                 updatedPremiums = prevState.map((item) =>
    //                     item.unit_id === selectedUnit?.unit_id
    //                         ? {
    //                               ...item,
    //                               additional_premium_id:
    //                                   item.additional_premium_id.includes(
    //                                       premium.id
    //                                   )
    //                                       ? item.additional_premium_id
    //                                       : [
    //                                             ...item.additional_premium_id,
    //                                             premium.id,
    //                                         ],
    //                           }
    //                         : item
    //                 );
    //             } else {
    //                 // If unit doesn't exist, create a new entry
    //                 updatedPremiums = [
    //                     ...prevState,
    //                     {
    //                         unit_id: selectedUnit?.unit_id,
    //                         additional_premium_id: [premium.id],
    //                     },
    //                 ];
    //             }
    //         } else {
    //             // Remove the premium ID when unchecked
    //             updatedPremiums = prevState
    //                 .map((item) =>
    //                     item.unit_id === selectedUnit?.unit_id
    //                         ? {
    //                               ...item,
    //                               additional_premium_id:
    //                                   item.additional_premium_id.filter(
    //                                       (id) => id !== premium.id
    //                                   ),
    //                           }
    //                         : item
    //                 )
    //                 .filter((item) => item.additional_premium_id.length > 0);
    //         }

    //         return updatedPremiums;
    //     });
    // };
    const handleCheckboxChange = (e, premium) => {
        const isChecked = e.target.checked;

        setSelectedAdditionalPremiums((prevState) => {
            // Find if the unit already exists in the selection
            const existingUnit = prevState.find(
                (item) => item.unit_id === selectedUnit?.unit_id
            );

            if (isChecked) {
                // Add premium ID if checked
                if (existingUnit) {
                    return prevState.map((item) =>
                        item.unit_id === selectedUnit?.unit_id
                            ? {
                                  ...item,
                                  additional_premium_id: [
                                      ...new Set([
                                          ...item.additional_premium_id,
                                          premium.id,
                                      ]), // Avoid duplicates
                                  ],
                              }
                            : item
                    );
                } else {
                    return [
                        ...prevState,
                        {
                            unit_id: selectedUnit?.unit_id,
                            additional_premium_id: [premium.id],
                        },
                    ];
                }
            } else {
                // Remove premium ID if unchecked
                if (existingUnit) {
                    return prevState
                        .map((item) =>
                            item.unit_id === selectedUnit?.unit_id
                                ? {
                                      ...item,
                                      additional_premium_id:
                                          item.additional_premium_id.filter(
                                              (id) => id !== premium.id
                                          ),
                                  }
                                : item
                        )
                        .filter(
                            (item) => item.additional_premium_id.length > 0
                        ); // Remove empty units
                } else {
                    return prevState;
                }
            }
        });
    };

    //Handle Apply premiums button
    const handleApplyPremiums = () => {
        setPricingData((prevState) => {
            const updatedPremiums = selectedAdditionalPremiums.map((item) => ({
                ...item,
                additional_premium_id:
                    item.additional_premium_id.length > 0
                        ? item.additional_premium_id
                        : [],
            }));

            return {
                ...prevState,
                selectedAdditionalPremiums:
                    updatedPremiums.length > 0 ? updatedPremiums : [],
            };
        });

        // Close the modal
        //    if (modalRef2.current) {
        //        modalRef2.current.close();
        //    }
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
     *
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
                <div className="flex justify-start gap-[10px] mb-[10px] items-center">
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
                                        // checked={
                                        //     (selectedUnit?.additional_premium_id?.includes(
                                        //         premium.id
                                        //     ) ??
                                        //         false) ||
                                        //     selectedAdditionalPremiums.some(
                                        //         (item) =>
                                        //             item.unit_id ===
                                        //                 selectedUnit?.unit_id &&
                                        //             item.additional_premium_id.includes(
                                        //                 premium.id
                                        //             )
                                        //     )
                                        // }
                                        type="checkbox"
                                        className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                    />
                                    <p>
                                        {premium.viewName} - {premium.id}
                                    </p>
                                </div>
                            );
                        })}

                    {/* <div className="h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]">
                        <input
                            type="checkbox"
                            className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                        />
                        <p>Mountain View</p>
                    </div>
                    <div className="h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]">
                        <input
                            type="checkbox"
                            className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                        />
                        <p>City View</p>
                    </div>
                    <div className="h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]">
                        <input
                            type="checkbox"
                            className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                        />
                        <p>Lucky Unit Number</p>
                    </div>
                    <div className="h-[56px] w-full bg-custom-grayFA rounded-[10px] p-[10px] flex items-center gap-[15px]">
                        <input
                            type="checkbox"
                            className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                        />
                        <p>Corner unit with extra window</p>
                    </div> */}
                </div>
                <div className="flex justify-start mt-4 mb-8">
                    <button
                        disabled={!hasChanges()}
                        // className={`w-[151px] h-[37px] text-white montserrat-semibold text-sm gradient-btn5 rounded-[10px] hover:shadow-custom4 ${
                        //     selectedAdditionalPremiums.length === 0 ||
                        //     !selectedAdditionalPremiums.some(
                        //         (item) =>
                        //             item.unit_id === selectedUnit?.unit_id &&
                        //             item.additional_premium_id.length > 0
                        //     )
                        //         ? "opacity-50 cursor-not-allowed"
                        //         : ""
                        // }`}
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
