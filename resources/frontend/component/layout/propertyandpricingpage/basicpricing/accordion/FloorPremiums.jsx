import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import FloorPremiumAssignModal from "../modals/FloorPremiumAssignModal";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/context/BasicPricingContext";
import { showToast } from "@/util/toastUtil";
import UnitUploadButton from "@/component/layout/propertyandpricingpage/component/UnitUploadButton";
import CustomInput from "@/component/Input/CustomInput";
import FloorPremiumRow from "@/component/layout/propertyandpricingpage/component/TableRows/FloorPremiumRow";
import CustomTable from "@/component/layout/propertyandpricingpage/component/CustomTable";

const newFloorState = {
    floor: null,
    premiumCost: 0,
    excludedUnits: [],
};

const COLUMNS = [
    { label: "Floor", width: "w-[150px]" },
    { label: "Premium Cost", width: "w-[150px]" },
    { label: "Lucky No.", width: "w-[150px]" },
    { label: "Unit Assignment", width: "w-[150px]" },
    { label: "", width: "w-[62px]" },
];

const FloorPremiums = ({ isOpen, toggleAccordion, priceListData }) => {
    //States
    const [newFloorPremiumData, setNewFloorPremiumData] =
        useState(newFloorState);
    const floorPremiumAssignModalRef = useRef(null);
    const { floors, isFloorCountLoading, excelId } = useUnit();
    const [selectedFloor, setSelectedFloor] = useState(null);
    const { pricingData, setPricingData } = usePricing();

    //Hooks
    useEffect(() => {
        if (!floors || Object.keys(floors).length === 0) return;
        if (
            excelId &&
            pricingData.floorPremiums &&
            Object.keys(pricingData.floorPremiums).length > 0
        ) {
            return;
        }

        if (excelId) {
            const floorNumbers = floors[Object.keys(floors)[0]];
            if (Array.isArray(floorNumbers) && floorNumbers.length > 0) {
                const initialFloorPremiums = floorNumbers.reduce(
                    (acc, floor) => {
                        acc[floor] = {
                            premiumCost: 0,
                            luckyNumber: false,
                            excludedUnits: [],
                        };
                        return acc;
                    },
                    {}
                );

                setPricingData((prev) => ({
                    ...prev,
                    floorPremiums: initialFloorPremiums,
                }));
            }
        }
    }, [floors, excelId]);

    //Event handler
    //Handle to open modal to assign floor premiums
    const handleOpenModal = (floor) => {
        setSelectedFloor(floor);
        if (floorPremiumAssignModalRef.current) {
            floorPremiumAssignModalRef.current.showModal();
        }
    };

    // Handles changes in floor premium inputs (e.g., premium cost)
    const handleFloorPremiumChange = (floorNumber, e) => {
        const { name, type, checked, value } = e.target;
        if (
            !pricingData?.floorPremiums ||
            Object.keys(pricingData?.floorPremiums).length === 0
        ) {
            console.log("pricingData.floorPremiums is empty or not available");
            return;
        }

        const floorPremiums = pricingData.floorPremiums[floorNumber];
        if (!floorPremiums) {
            console.log(`No premium data for floor ${floorNumber}`);
            return;
        }

        const updatedFloorPremiums = {
            ...floorPremiums,
            [name]: type === "checkbox" ? checked : value,
        };

        setPricingData((prevState) => ({
            ...prevState,
            floorPremiums: {
                ...prevState.floorPremiums,
                [floorNumber]: updatedFloorPremiums,
            },
        }));
    };

    //Handle input change for adding  new floor
    const handleNewFloorInputChange = (e) => {
        const { name, value } = e.target;
        setNewFloorPremiumData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddNewFloor = () => {
        const { floor, premiumCost, excludedUnits } = newFloorPremiumData;

        if (!floor || !premiumCost) {
            showToast("Floor and Premium Cost are required", "error");
            return;
        }

        // Handle the case when floorPremiums is empty
        if (
            !pricingData?.floorPremiums ||
            Object.keys(pricingData.floorPremiums).length === 0
        ) {
            setPricingData((prevState) => ({
                ...prevState,
                floorPremiums: {
                    [floor]: {
                        premiumCost,
                        luckyNumber: false,
                        excludedUnits: excludedUnits || [],
                    },
                },
                floors: [floor],
            }));
            return;
        }

        const isFloorExist = Object.keys(pricingData.floorPremiums).includes(
            floor.toString()
        );

        if (isFloorExist) {
            showToast(`Floor ${floor} already exists.`, "error");
            return;
        }

        setPricingData((prevState) => ({
            ...prevState,
            floorPremiums: {
                ...prevState.floorPremiums,
                [floor]: {
                    premiumCost,
                    luckyNumber: false,
                    excludedUnits: excludedUnits || [],
                },
            },
        }));

        showToast(`Floor ${floor} added successfully`, "success");
        setNewFloorPremiumData(newFloorState);
    };

    //Handle remove floor premium
    const handleRemoveFloorPremium = (floorNumber) => {
        setPricingData((prevPricingData) => {
            const updatedFloorPremiums = { ...prevPricingData.floorPremiums };
            delete updatedFloorPremiums[floorNumber];

            return {
                ...prevPricingData,
                floorPremiums: updatedFloorPremiums,
            };
        });
    };

    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${
          isOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => toggleAccordion("floorPremiums")}
                    className={`
            ${
                isOpen
                    ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                    : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
            } `}
                >
                    <span
                        className={` text-custom-solidgreen ${
                            isOpen
                                ? "text-[20px] montserrat-semibold"
                                : "text-[18px] montserrat-regular"
                        }`}
                    >
                        Floor Premiums
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${
                            isOpen
                                ? "rotate-180 bg-[#F3F7F2] text-custom-solidgreen"
                                : "rotate-0 gradient-btn2 text-white"
                        }`}
                    >
                        <IoIosArrowDown className=" text-[18px]" />
                    </span>
                </button>
            </div>
            <div
                className={`mx-5 rounded-[10px] shadow-custom5 grid overflow-hidden transition-all duration-300 ease-in-out
            ${
                isOpen
                    ? "mt-2 mb-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
            `}
            >
                <div className="bg-white overflow-hidden">
                    <div className="w-full p-5 h-[370px]">
                        {excelId ? (
                            priceListData &&
                            priceListData.data.status === "Draft" ? (
                                <div className="flex justify-center w-full h-[31px] gap-3 mb-4">
                                    <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                        <span className="text-custom-gray81 bg-custom-grayFA flex items-center w-[120%] font-semibold -mr-3 pl-3 py-1">
                                            Floor
                                        </span>
                                        <CustomInput
                                            type="number"
                                            name="floor"
                                            value={
                                                newFloorPremiumData.floor || ""
                                            }
                                            className="w-full px-4 focus:outline-none"
                                            onChange={handleNewFloorInputChange}
                                            restrictNumbers={true}
                                        />
                                    </div>
                                    <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                        <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[250px] pl-3 py-1">
                                            Cost (Sq.m)
                                        </span>
                                        <CustomInput
                                            type="number"
                                            name="premiumCost"
                                            value={
                                                newFloorPremiumData.premiumCost ||
                                                ""
                                            }
                                            className="w-full px-4 focus:outline-none"
                                            onChange={handleNewFloorInputChange}
                                            restrictNumbers={true}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            className="w-[60px] h-[31px] rounded-[7px] gradient-btn2 p-[4px] text-custom-solidgreen hover:shadow-custom4 text-sm"
                                            onClick={handleAddNewFloor}
                                        >
                                            <div className="flex justify-center items-center bg-white montserrat-bold h-full w-full rounded-[4px] p-[4px]">
                                                ADD
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ) : null
                        ) : (
                            <div className="w-auto">
                                <UnitUploadButton
                                    buttonType="link"
                                    priceListData={priceListData}
                                />
                            </div>
                        )}

                        <div className="flex justify-center w-full    h-[300px] overflow-y-auto">
                            <div className="w-[662px]">
                                <CustomTable
                                    tableSkeleton={40}
                                    className="h-[49px] flex bg-custom-grayFA text-custom-gray81 montserrat-semibold text-sm"
                                    isLoading={
                                        isFloorCountLoading && floors.length === 0
                                    }
                                    columns={COLUMNS}
                                    data={
                                        pricingData
                                            ? Object.entries(
                                                  pricingData?.floorPremiums
                                              )
                                            : []
                                    }
                                    renderRow={(
                                        [floorNumber, floorData],
                                        index
                                    ) => {
                                        return (
                                            <FloorPremiumRow
                                                key={floorNumber}
                                                floorNumber={floorNumber}
                                                floorData={floorData}
                                                onChangeFloorPremium={
                                                    handleFloorPremiumChange
                                                }
                                                handleOpenModal={
                                                    handleOpenModal
                                                }
                                                priceListData={priceListData}
                                                handleRemoveFloorPremium={
                                                    handleRemoveFloorPremium
                                                }
                                            />
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <FloorPremiumAssignModal
                    priceListData={priceListData}
                    floorPremiumAssignModalRef={floorPremiumAssignModalRef}
                    selectedFloor={selectedFloor}
                />
            </div>
        </>
    );
};

export default FloorPremiums;
