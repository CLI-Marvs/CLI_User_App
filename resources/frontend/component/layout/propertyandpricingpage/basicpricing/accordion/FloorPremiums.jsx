import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import FloorPremiumAssignModal from "../modals/FloorPremiumAssignModal";
import CircularProgress from "@mui/material/CircularProgress";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { showToast } from "@/util/toastUtil";
import { property } from "lodash";

const newFloorState = {
    floor: null,
    premiumCost: null,
    excludedUnits: [],
};

const FloorPremiums = ({ propertyData }) => {
    //States
    const [newFloorPremiumData, setNewFloorPremiumData] =
        useState(newFloorState);
    const modalRef = useRef(null);

    const {
        floors,
        isLoading,
        floorPremiumsAccordionOpen,
        setFloorPremiumsAccordionOpen,
        checkExistingUnits,
        setFloors,
    } = useUnit();

    const [selectedFloor, setSelectedFloor] = useState(null);
    const { pricingData, setPricingData } = usePricing();
    const [towerPhaseId, setTowerPhaseId] = useState(null);
    // console.log("PricingData", pricingData);
    //Hooks
    useEffect(() => {
        setTowerPhaseId(propertyData?.tower_phase_id);
        if (floors && Object.keys(floors).length > 0) {
            // Get the first (and only) key dynamically
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
                //  setFloorPremiums(initialFloorPremiums); // Ensure this updates your state

                setPricingData((prev) => ({
                    ...prev,
                    floorPremiums: initialFloorPremiums,
                }));
            }
        }

        // if (floorPremiumsAccordionOpen) {
        //     // console.log("it runs here")
        //     checkExistingUnits(towerPhaseId, propertyData?.excel_id);
        // }
    }, [floors, propertyData]);

    useEffect(() => {
        if (floorPremiumsAccordionOpen) {
            setFloors([]);
        }
    }, [floorPremiumsAccordionOpen]);

    //Event handler
    //Handle to open modal to assign floor premiums
    const handleOpenModal = (floor) => {
        setSelectedFloor(floor);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    //  Handle to input floor premiums data(e.g premium cost)
    const handleOnChange = (floorNumber, e) => {
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

        // Update the floorPremiums state
        const updatedFloorPremiums = {
            ...floorPremiums,
            [name]: type === "checkbox" ? checked : value,
        };

        // Update the floorPremiums object (assuming you're using a state setter like setFloorPremiums)
        setPricingData((prevState) => ({
            ...prevState,
            floorPremiums: {
                ...prevState.floorPremiums,
                [floorNumber]: updatedFloorPremiums,
            },
        }));
    };

    //Handling changes for adding  new floor
    function handleNewFloorChange(e) {
        const { name, value } = e.target;
        setNewFloorPremiumData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    /**
     * Handling the button click for adding a new floor
     * If entered new floor (e.g.2 ) is already in the 'floor array' [floor=2], show an error toast
     * Else, add to the floorPremiumFormData
     */
    const handleAddNewFloor = () => {
        const { floor, premiumCost, excludedUnits } = newFloorPremiumData;

        // Early return if required fields are missing
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

        // Check if floor already exists
        const isFloorExist = Object.keys(pricingData.floorPremiums).includes(
            floor.toString()
        );

        if (isFloorExist) {
            showToast(`Floor ${floor} already exists.`, "error");
            return;
        }

        // Add new floor data
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
    };

    //Utility function to format the premium cost
    const formatPremiumCost = (premiumCost) => {
        if (premiumCost === 0) {
            return "0";
        }
        return premiumCost;
    };
    return (
        <>
            <div
                className={`transition-all duration-2000 ease-in-out
      ${
          floorPremiumsAccordionOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() =>
                        setFloorPremiumsAccordionOpen(
                            !floorPremiumsAccordionOpen
                        )
                    }
                    className={`
            ${
                floorPremiumsAccordionOpen
                    ? "flex justify-between items-center h-full w-full bg-white rounded-[9px] px-[15px]"
                    : "flex justify-between items-center h-full w-full bg-custom-grayFA rounded-[9px] px-[15px]"
            } `}
                >
                    <span
                        className={` text-custom-solidgreen ${
                            floorPremiumsAccordionOpen
                                ? "text-[20px] montserrat-semibold"
                                : "text-[18px] montserrat-regular"
                        }`}
                    >
                        Floor Premiums
                    </span>
                    <span
                        className={`flex justify-center items-center h-[40px] w-[40px] rounded-full  transform transition-transform duration-300 ease-in-out ${
                            floorPremiumsAccordionOpen
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
                floorPremiumsAccordionOpen
                    ? "mt-2 mb-4 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
            `}
            >
                <div className="bg-white overflow-hidden">
                    <div className="w-full p-5 h-[370px]">
                        <div className="flex justify-center w-full h-[31px] gap-3 mb-4">
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm  ">
                                <span className="text-custom-gray81 bg-custom-grayFA  flex items-center w-[120%] font-semibold -mr-3 pl-3 py-1">
                                    Floor
                                </span>
                                <input
                                    onChange={handleNewFloorChange}
                                    name="floor"
                                    value={newFloorPremiumData.floor || ""}
                                    className="outline-none  -mr-3 pl-3 py-1 bg-custom-grayFA   w-full "
                                    onInput={(e) =>
                                        (e.target.value =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            ))
                                    }
                                />
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[250px] pl-3 py-1">
                                    Cost (Sq.m)
                                </span>
                                <input
                                    onChange={handleNewFloorChange}
                                    name="premiumCost"
                                    className="w-full px-4 focus:outline-none "
                                    placeholder=""
                                    value={
                                        newFloorPremiumData.premiumCost || ""
                                    }
                                    onInput={(e) =>
                                        (e.target.value =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            ))
                                    }
                                />
                            </div>
                            <div>
                                <button className="w-[60px] h-[31px] rounded-[7px] gradient-btn2 p-[4px]  text-custom-solidgreen hover:shadow-custom4 text-sm">
                                    <div
                                        className="flex justify-center items-center  bg-white montserrat-bold h-full w-full rounded-[4px] p-[4px]"
                                        onClick={handleAddNewFloor}
                                    >
                                        ADD
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center w-full    h-[300px] overflow-y-auto">
                            <div className="w-[662px]">
                                <table>
                                    <thead>
                                        <tr className="h-[49px] bg-custom-grayFA text-custom-gray81 montserrat-semibold text-sm">
                                            <th className="rounded-tl-[10px] pl-[10px] w-[150px] text-left">
                                                Floor
                                            </th>
                                            <th className="w-[150px] text-left">
                                                Premium Cost
                                            </th>
                                            <th className="w-[150px] text-left">
                                                Lucky No.
                                            </th>
                                            <th className="w-[150px] text-left">
                                                Unit Assignment
                                            </th>
                                            <th className="rounded-tr-[10px] w-[62px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {isLoading ? (
                                            <tr className="ml-4">
                                                <td
                                                    colSpan="5"
                                                    className="text-center"
                                                >
                                                    <CircularProgress className="spinnerSize" />
                                                </td>
                                            </tr>
                                        ) : pricingData &&
                                          Object.keys(
                                              pricingData?.floorPremiums
                                          ).length > 0 ? (
                                            Object.entries(
                                                pricingData?.floorPremiums
                                            ).map(
                                                (
                                                    [floorNumber, floorData],
                                                    index
                                                ) => {
                                                    return (
                                                        <tr
                                                            className="h-[46px] bg-white text-sm"
                                                            key={index}
                                                        >
                                                            <td className="text-custom-gray81 pl-4">
                                                                {floorNumber}
                                                            </td>
                                                            <td>
                                                                <div className="">
                                                                    <input
                                                                        type="number"
                                                                        name="premiumCost"
                                                                        id="premiumCost"
                                                                        value={
                                                                            floorData.premiumCost
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleOnChange(
                                                                                floorNumber,
                                                                                e
                                                                            )
                                                                        }
                                                                        className="bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2 outline-none text-center"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleOnChange(
                                                                            floorNumber,
                                                                            e
                                                                        )
                                                                    }
                                                                    checked={
                                                                        floorData.luckyNumber ||
                                                                        false
                                                                    }
                                                                    name="luckyNumber"
                                                                    id="luckyNumber"
                                                                    type="checkbox"
                                                                    className="h-[16px] w-[16px] ml-[16px] rounded-[2px] appearance-none border border-gray-400 checked:bg-transparent flex items-center justify-center checked:before:bg-black checked:before:w-[12px] checked:before:h-[12px] checked:before:block checked:before:content-['']"
                                                                />
                                                            </td>
                                                            <td
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        floorNumber
                                                                    )
                                                                }
                                                                className="text-blue-500 underline cursor-pointer"
                                                            >
                                                                Assign
                                                            </td>
                                                            <td>
                                                                <FaRegTrashAlt className="size-5 text-custom-gray81 hover:text-red-500 cursor-pointer" />
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center text-custom-gray81 py-2 montserrat-semibold"
                                                >
                                                    No floor premiums
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <FloorPremiumAssignModal
                    modalRef={modalRef}
                    selectedFloor={selectedFloor}
                    towerPhaseId={towerPhaseId}
                    propertyData={propertyData}
                />
            </div>
        </>
    );
};

export default FloorPremiums;
