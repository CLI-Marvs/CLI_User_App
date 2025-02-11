import React, { useRef, useEffect, useState, useMemo } from "react";
import PremiumChecklistModal from "./PremiumChecklistModal";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";

const AdditionalPremiumAssignModal = ({ modalRef, propertyData }) => {
    //States
    const modalRef2 = useRef(null);
    const { checkExistingUnits, excelId, towerPhaseId, units } = useUnit();
    const [formattedUnits, setFormattedUnits] = useState([]);
    const [localExcelId, setLocalExcelId] = useState(null);
    const [localTowerPhaseId, setLocalTowerPhaseId] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState({});
    const { pricingData, setPricingData } = usePricing();

    //Hooks
    useEffect(() => {
        setLocalExcelId(propertyData?.excel_id || excelId);
        setLocalTowerPhaseId(propertyData?.tower_phase_id || towerPhaseId);
    }, [propertyData]);

    useEffect(() => {
        if (localExcelId && localTowerPhaseId) {
            checkExistingUnits(localTowerPhaseId, localExcelId);
        }
    }, [localExcelId, localTowerPhaseId]);

    const groupedByFloor = useMemo(() => {
        if (!units) return {};

        return units.reduce((acc, item) => {
            if (!acc[item.floor]) {
                acc[item.floor] = [];
            }
            acc[item.floor].push({
                id: item.id,
                unit: item.unit,
                additional_premium_id: item.additional_premium_id,
            });
            return acc;
        }, {});
    }, [units]);

    useEffect(() => {
        setFormattedUnits(groupedByFloor);
    }, [groupedByFloor]);

    //Event Handler
    // const handleOpenModal = (id, unit, additional_premium_id) => {
    //     if (modalRef2.current) {
    //         const existingUnit = pricingData.selectedAdditionalPremiums.find(
    //             (item) => item.unit_id === id
    //         );
    //         console.log("existingUnit", existingUnit);
    //         console.log("additional_premium_id", additional_premium_id);

    //         setSelectedUnit({
    //             unit_id: id,
    //             unit_name: unit,
    //             additional_premium_id: existingUnit
    //                 ? [
    //                       ...new Set([
    //                           ...existingUnit.additional_premium_id,
    //                           ...additional_premium_id,
    //                       ]),
    //                   ]
    //                 : additional_premium_id,
    //         });

    //         modalRef2.current.showModal();
    //     }
    // };
    const handleOpenModal = (id, unit, additional_premium_id) => {
        if (modalRef2.current) {
            setSelectedUnit((prevUnit) => {
                const existingUnit =
                    pricingData.selectedAdditionalPremiums.find(
                        (item) => item.unit_id === id
                    );

                return {
                    unit_id: id,
                    unit_name: unit,
                    additional_premium_id: existingUnit
                        ? [
                              ...new Set([
                                  ...(existingUnit.additional_premium_id || []),
                                  ...(additional_premium_id || []),
                              ]),
                          ]
                        : additional_premium_id || [], // Ensure fallback to an empty array
                };
            });

            modalRef2.current.showModal();
        }
    };

    return (
        <>
            <dialog
                className="modal w-[1200px] rounded-lg bg-custom-grayFA backdrop:bg-black/50"
                ref={modalRef}
            >
                <div className=" px-14 mb-5 rounded-[10px]">
                    <div className="">
                        <form
                            method="dialog"
                            className="pt-2 flex justify-end -mr-[50px]"
                        >
                            <button className="flex justify-center w-10 h-10 items-center rounded-full text-custom-bluegreen hover:bg-custombg">
                                ✕
                            </button>
                        </form>
                    </div>
                    <div className="flex justify-start items-center gap-[30px] h-[40px] my-6 ">
                        <p className="montserrat-bold text-[21px]">
                            Unit Assignment
                        </p>
                        <p className="montserrat-regular text-[21px]">
                            Additional Premium
                        </p>
                    </div>
                    <div className="flex items-center p-[20px] h-[91px] gap-[22px] border-b-1 border-custom-lightestgreen mb-[30px]">
                        <p className="text-custom-gray81">Legend</p>
                        <div className="h-full border border-r-custom-lightestgreen"></div>
                        <div className="flex justify-center items-center h-[51px] w-[89px] bg-white rounded-[10px]">
                            <p className="text-custom-gray81 font-bold">
                                0000000
                            </p>
                        </div>
                        <p>Excluded units from premium rate</p>
                        <div className="h-full border border-r-custom-lightestgreen"></div>
                        <div className="h-[63px] w-[95px] p-[6px] rounded-[15px] gradient-btn4">
                            <div className="flex  justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px]">
                                <p className="font-bold">0000000</p>
                            </div>
                        </div>
                        <p>Selected units for floor premium rate</p>
                    </div>
                    {formattedUnits && Object.keys(formattedUnits).length > 0
                        ? Object.entries(formattedUnits).map(
                              ([floorId, units]) => {
                                  return (
                                      <div
                                          key={floorId}
                                          className="h-auto flex gap-5 pb-8 mb-8 border-b border-custom-lightestgreen"
                                      >
                                          {/* Floor Number */}
                                          <div className="h-full flex justify-start items-start">
                                              <div className="w-[50px] h-[63px] bg-custom-lightestgreen p-2 rounded-[15px]">
                                                  <div className="flex justify-center items-center bg-white h-full w-full rounded-[10px]">
                                                      <p className="font-bold text-[21px]">
                                                          {floorId}
                                                      </p>
                                                  </div>
                                              </div>
                                          </div>

                                          {/* Unit Buttons */}
                                          <div className="flex flex-wrap gap-3">
                                              {units &&
                                                  units.map(
                                                      ({
                                                          id,
                                                          unit,
                                                          additional_premium_id,
                                                      }) => {
                                                            const isSelected =
                                                                pricingData.selectedAdditionalPremiums?.some(
                                                                    (item) =>
                                                                        item.unit_id ===
                                                                        id
                                                                ) ||
                                                                (additional_premium_id &&
                                                                    additional_premium_id.length >
                                                                        0);
                                                          
                                                          //   const isSelected =
                                                          //       pricingData.selectedAdditionalPremiums?.some(
                                                          //           (item) =>
                                                          //               item.unit_id ===
                                                          //                   id &&
                                                          //               item
                                                          //                   .additional_premium_id
                                                          //                   .length >
                                                          //                   0
                                                          //       );

                                                          return (
                                                              <button
                                                                  key={id}
                                                                  onClick={() =>
                                                                      handleOpenModal(
                                                                          id,
                                                                          unit,
                                                                          additional_premium_id
                                                                      )
                                                                  }
                                                                  className="h-[63px] w-[95px]   rounded-[15px] bg-white "
                                                              >
                                                                  <div
                                                                      className={`h-[63px] w-[95px] p-[6px] rounded-[15px] ${
                                                                          isSelected
                                                                              ? "gradient-btn4 "
                                                                              : ""
                                                                      }  `}
                                                                  >
                                                                      <div className="flex  justify-center items-center bg-white h-full w-full text-custom-solidgreen rounded-[10px]">
                                                                          <p className="font-bold">
                                                                              {
                                                                                  unit
                                                                              }
                                                                          </p>
                                                                      </div>
                                                                  </div>
                                                              </button>
                                                          );
                                                      }
                                                  )}
                                          </div>
                                      </div>
                                  );
                              }
                          )
                        : null}

                    {/* <div className="h-auto flex gap-[20px] pb-[30px] mb-[30px] border-b border-custom-lightestgreen">
                        <div className="h-full flex justify-start items-start">
                            <div className="w-[50px] h-[63px] bg-custom-lightestgreen p-[6px] rounded-[15px]">
                                <div className="flex justify-center items-center bg-white h-full w-full rounded-[10px]">
                                    <p className="font-bold text-[21px]">2</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleOpenModal}
                                className="h-[63px] w-[95px] p-[6px] rounded-[15px] gradient-btn4"
                            >
                                <div className="flex justify-center items-center bg-white h-full w-full  rounded-[10px]">
                                    <p className="font-bold text-custom-solidgreen">
                                        38P101
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={handleOpenModal}
                                className="h-[63px] w-[95px] p-[6px] rounded-[15px] bg-white"
                            >
                                <div className="flex justify-center items-center bg-white h-full w-full  rounded-[10px]">
                                    <p className="font-bold text-custom-gray81">
                                        38P101
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div> */}
                </div>
                <div>
                    <PremiumChecklistModal
                        selectedUnit={selectedUnit}
                        modalRef2={modalRef2}
                    />
                </div>
            </dialog>
        </>
    );
};

export default AdditionalPremiumAssignModal;
