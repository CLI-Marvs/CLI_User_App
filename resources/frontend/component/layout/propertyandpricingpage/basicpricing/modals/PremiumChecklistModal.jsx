import React, { useState } from "react";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const PremiumChecklistModal = ({ modalRef2, selectedUnit }) => {
    //States
    const { pricingData, setPricingData } = usePricing();
    const [selectedAdditionalPremiums, setSelectedAdditionalPremiums] =
        useState([]);

    //Event handler
    //Handle checkbox change
    const handleCheckboxChange = (e, premium) => {
        setSelectedAdditionalPremiums((prevState) => {
            const existingUnit = prevState.find(
                (item) => item.unit_id === selectedUnit?.unit_id
            );

            let updatedPremiums;

            if (e.target.checked) {
                if (existingUnit) {
                    updatedPremiums = prevState.map((item) =>
                        item.unit_id === selectedUnit?.unit_id
                            ? {
                                  ...item,
                                  additional_premium_id:
                                      item.additional_premium_id.includes(
                                          premium.id
                                      )
                                          ? item.additional_premium_id
                                          : [
                                                ...item.additional_premium_id,
                                                premium.id,
                                            ],
                              }
                            : item
                    );
                } else {
                    // If unit doesn't exist, create a new entry
                    updatedPremiums = [
                        ...prevState,
                        {
                            unit_id: selectedUnit?.unit_id,
                            additional_premium_id: [premium.id],
                        },
                    ];
                }
            } else {
                // Remove the premium ID when unchecked
                updatedPremiums = prevState
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
                    .filter((item) => item.additional_premium_id.length > 0);
            }

            return updatedPremiums;
        });
    };

    //Handle Apply premiums button
    const handleApplyPremiums = () => {
        setPricingData((prevState) => ({
            ...prevState,
            selectedAdditionalPremiums: [...selectedAdditionalPremiums],
        }));

        //Close the modal
        handleCloseModal();
    };

    //Handle close the modal
    const handleCloseModal = () => {
        if (modalRef2.current) {
            // setSelectedAdditionalPremiums([]);
            modalRef2.current.close();
        }
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
                        disabled={
                            selectedAdditionalPremiums.length === 0 ||
                            !selectedAdditionalPremiums.some(
                                (item) =>
                                    item.unit_id === selectedUnit?.unit_id &&
                                    item.additional_premium_id.length > 0
                            )
                        }
                        className={`w-[151px] h-[37px] text-white montserrat-semibold text-sm gradient-btn5 rounded-[10px] hover:shadow-custom4 ${
                            selectedAdditionalPremiums.length === 0 ||
                            !selectedAdditionalPremiums.some(
                                (item) =>
                                    item.unit_id === selectedUnit?.unit_id &&
                                    item.additional_premium_id.length > 0
                            )
                                ? "opacity-50 cursor-not-allowed"
                                : ""
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
