import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import FloorPremiumAssignModal from "../modals/FloorPremiumAssignModal";
import { useStateContext } from "../../../../../context/contextprovider";
// import { useFloorPremiumStateContext } from "../../../../../context/FloorPremium/FloorPremiumContext";
import CircularProgress from "@mui/material/CircularProgress";

const FloorPremiums = ({ propertyId }) => {
    //State
    const {
        towerPhaseId,
        floorPremiumsAccordionOpen,
        setFloorPremiumsAccordionOpen,
        propertyFloors,
        setTowerPhaseId,
        isLoading,
        setPropertyFloors,
        getPropertyFloors,
        setSelectedFloor,
    } = useStateContext();
    // const { floorPremiumFormData, setFloorPremiumFormData } =
    //     useFloorPremiumStateContext();
    const modalRef = useRef(null);
    const [newFloor, setNewFloor] = useState("");
    const [newPremiumCost, setNewPremiumCost] = useState("");

    //Hooks
    /**
     * This hooks retrieves the floor data associated with the specified tower phase ID. It checks if the data already exists in the propertyFloors state; if it does, it initializes the floor premium form data with the necessary structure. If the data is not available, it resets the form data and initiates a fetch request to obtain the floor information. This ensures that the component has the most up-to-date floor data while maintaining the appropriate structure for further processing.
     */
    // useEffect(() => {
    //     if (!towerPhaseId) return;
    //     setTowerPhaseId(towerPhaseId);

    //     // Function to fetch floor data
    //     const fetchFloorData = async () => {
    //         const response = await getPropertyFloors(towerPhaseId);
    //         setPropertyFloors((prev) => ({
    //             ...prev,
    //             [towerPhaseId]: response,
    //         }));
    //     };

    //     // Fetch or use existing floor data
    //     if (
    //         propertyFloors &&
    //         propertyFloors[towerPhaseId] &&
    //         propertyFloors[towerPhaseId].floors
    //     ) {
    //         const floors = propertyFloors[towerPhaseId].floors || [];

    //         // Initialize floor data with the required structure from FloorPremiumContext
    //         const initializedFloors = floors.map((floor) => ({
    //             floor,
    //             premiumCost: "",
    //             luckyNumber: false,
    //             excludedUnits: [],
    //         }));

    //         setFloorPremiumFormData((prevData) => ({
    //             ...prevData,
    //             floor: initializedFloors, // Update floor data in the form context
    //         }));
    //     } else {
    //         // Reset form data if propertyFloors is not available
    //         setFloorPremiumFormData((prevData) => ({
    //             ...prevData,
    //             floor: [],
    //         }));
    //         fetchFloorData(); // Fetch data if it's not already available
    //     }
    // }, [
    //     towerPhaseId,
    //     propertyFloors,
    //     setFloorPremiumFormData,
    //     getPropertyFloors,
    // ]);

    //Event handler
    /**
     * Handle to open modal to assign floor premiums
     */
    const handleOpenModal = (floor) => {
        setSelectedFloor(floor);
        setTowerPhaseId(towerPhaseId);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    }; 

    /*
    Handle to input floor premiums data(e.g premium cost)
    */
    const handleOnChange = (index, e) => {
        // const { name, type, checked, value } = e.target;

        // setFloorPremiumFormData((prevData) => {
        //     const updatedFloors = [...prevData.floor];
        //     updatedFloors[index] = {
        //         ...updatedFloors[index],
        //         [name]: type === "checkbox" ? checked : value,
        //     };
        //     // console.log("Updated Floors: ", updatedFloors);
        //     return {
        //         ...prevData,
        //         floor: updatedFloors, // Update the floors in the context
        //     };
        // });
    };

    /*
     Handling changes for adding  new floor
    */
    function handleNewFloorChange(e) {
        const { name, value } = e.target;
        if (name === "newFloor") {
            setNewFloor(value);
        } else if (name === "premiumCost") {
            setNewPremiumCost(value);
        }
    }

    /*
    Handling the button click for adding a new floor 
    */
    const handleAddNewFloor = () => {
        // Check if propertyFloors and towerPhaseId are defined before accessing them
        if (
            propertyFloors[towerPhaseId] &&
            propertyFloors[towerPhaseId]["count"] === 0
        ) {
            alert(
                "You cannot add a floor until you upload an Excel file first."
            );
            return;
        }

        if (newFloor && newPremiumCost) {
            // Check if the new floor already exists in the form data
            // const newFloorIsExist = floorPremiumFormData.floor.some(
            //     (floorData) => parseInt(floorData.floor) === parseInt(newFloor)
            // );
            if (newFloorIsExist) {
                alert("This floor already exists.");
                return;
            }

            // Add the new floor and premium cost to the floorPremiumFormData
            // setFloorPremiumFormData((prevData) => ({
            //     ...prevData,
            //     floor: [
            //         ...prevData.floor,
            //         {
            //             floor: parseInt(newFloor),
            //             premiumCost: parseInt(newPremiumCost),
            //             luckyNumber: "",
            //             excludedUnits: [],
            //         },
            //     ],
            // }));

            //Reset inputs after adding
            setNewFloor("");
            setNewPremiumCost("");
        } else {
            alert("Please fill in both floor and premium cost.");
        }
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
                                    type="number"
                                    name="newFloor"
                                    value={newFloor}
                                    className="outline-none  -mr-3 pl-3 py-1 bg-custom-grayFA text-custom-gray81 w-full "
                                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                                />
                                {/* <div className="relative w-full">
                                    <select
                                        name="transferCharge"
                                        className="appearance-none w-full px-4 py-1 bg-white focus:outline-none border-0"
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pl-3 bg-custom-grayFA">
                                        <IoMdArrowDropdown className="text-custom-gray81" />
                                    </span>
                                </div> */}
                            </div>
                            <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                <span className="text-custom-gray81 bg-custom-grayFA font-semibold flex w-[250px] pl-3 py-1">
                                    Cost (Sq.m)
                                </span>
                                <input
                                    onChange={handleNewFloorChange}
                                    name="premiumCost"
                                    type="number"
                                    className="w-full px-4 focus:outline-none "
                                    placeholder=""
                                    value={newPremiumCost}
                                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
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
                                    {/* <tbody className="">
                                        {isLoading ? (
                                            <tr className="">
                                                <CircularProgress className="spinnerSize " />
                                            </tr>
                                        ) : (
                                            floorPremiumFormData.floor &&
                                            floorPremiumFormData.floor.length >
                                                0 &&
                                            floorPremiumFormData.floor.map(
                                                (floor, index) => (
                                                    <tr
                                                        className="h-[46px] bg-white text-sm"
                                                        key={index}
                                                    >
                                                        <td className="text-custom-gray81">
                                                           
                                                            {index}

                                                            <input
                                                                type="text"  
                                                                className="text-custom-gray81 bg-white h-[29px] w-[80px]   border-[#D9D9D9] rounded-[5px] px-2 outline-none"
                                                                defaultValue={
                                                                    floor.floor
                                                                }
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="">
                                                                <input
                                                                    type="number"
                                                                    name="premiumCost"
                                                                    id="premiumCost"
                                                                    value={
                                                                        floor.premiumCost
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleOnChange(
                                                                            index,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2 outline-none"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                onChange={(e) =>
                                                                    handleOnChange(
                                                                        index,
                                                                        e
                                                                    )
                                                                }
                                                                checked={
                                                                    floor.luckyNumber ||
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
                                                                    floor.floor
                                                                )
                                                            }
                                                            className="text-blue-500 underline cursor-pointer"
                                                        >
                                                            Assign
                                                        </td>
                                                        <td>
                                                            <FaRegTrashAlt className="size-5 text-custom-gray81 hover:text-red-500" />
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}

                                       
                                    </tbody> */}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <FloorPremiumAssignModal modalRef={modalRef} />
            </div>
        </>
    );
};

export default FloorPremiums;
