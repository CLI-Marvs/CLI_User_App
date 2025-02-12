import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import AdditionalPremiumAssignModal from "../modals/AdditionalPremiumAssignModal";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";

const AdditionalPremiums = ({ propertyData , isOpen, toggleAccordion }) => {
    //States
    const { excelId } = useUnit();
    const [newAdditionalPremium, setNewAdditionalPremium] = useState({
        viewName: "",
        premiumCost: 0,
        excludedUnitIds: [],
    });
    const modalRef = useRef(null);
    const [localExcelId, setLocalExcelId] = useState(null);
    const { setPricingData, pricingData } = usePricing();
 

    //Hooks
    useEffect(() => {
        setLocalExcelId(propertyData?.excel_id);
    }, [propertyData]);

    //Event Handler
    //Handle input on change
    const handleInputOnChange = (index, e) => {
        const { name, value } = e.target;
        setPricingData((prevPricingData) => ({
            ...prevPricingData,
            additionalPremiums: prevPricingData.additionalPremiums.map(
                (item, i) =>
                    i === index
                        ? {
                              ...item,
                              [name]:
                                  name === "premiumCost"
                                      ? parseFloat(value) || ""
                                      : value,
                          }
                        : item
            ),
        }));
    };

    //Handle to open modal
    const handleOpenModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };

    /**
     * Handle add new additional premium
     * If the entered new additional premium view is already in the 'additionalPremiums' array, show an error toast
     * Else, add to the additionalPremiumsFormData
     */
    const handleAddNewPremium = () => {
        const { viewName, premiumCost, excludedUnitIds } = newAdditionalPremium;

        if (!viewName || !premiumCost) {
            showToast("Name and Premium Cost are required.", "error");
            return;
        }

        const isPremiumExist = pricingData.additionalPremiums.find(
            (item) => item.viewName === viewName
        );

        if (isPremiumExist) {
            showToast(`Premium ${viewName} already exists.`, "error");
            return;
        }

        setPricingData((prevState) => ({
            ...prevState,
            additionalPremiums: [
                ...prevState.additionalPremiums,
                {
                    viewName,
                    premiumCost,
                    excludedUnitIds: excludedUnitIds || [],
                },
            ],
        }));

        setNewAdditionalPremium({});
        showToast(`Premium ${viewName} added successfully`, "success");
    };

    //Handle remove additional premium
    const handleRemovePremium = (index) => {
        setPricingData((prevPricingData) => ({
            ...prevPricingData,
            additionalPremiums: prevPricingData.additionalPremiums.filter(
                (_, i) => i !== index
            ),
        }));
    };

    //Handle new additional premium on change
    const handleNewAdditionalPremiumOnChange = (e) => {
        setNewAdditionalPremium((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <>
            <div
                className={` transition-all duration-2000 ease-in-out
      ${
          isOpen
              ? "h-[74px] mx-5 bg-white shadow-custom5 rounded-[10px]"
              : "h-[72px] gradient-btn3 rounded-[10px] p-[1px]"
      } `}
            >
                <button
                    onClick={() => toggleAccordion("additionalPremiums")}
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
                        Additional Premiums
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
                <div className=" overflow-hidden">
                    <div className="w-full p-5">
                        {(localExcelId !== null &&
                            localExcelId !== undefined) ||
                        (excelId !== null && excelId !== undefined) ? (
                            <div className="flex justify-center w-full h-[31px] gap-3 mb-4">
                                <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                    <span className="text-custom-gray81 bg-custombg3 flex items-center w-[100%] font-semibold -mr-3 pl-3 py-1">
                                        Additional Premium
                                    </span>
                                    <div className="relative w-full">
                                        <input
                                            name="viewName"
                                            type="text"
                                            value={
                                                newAdditionalPremium.viewName ||
                                                ""
                                            }
                                            onChange={
                                                handleNewAdditionalPremiumOnChange
                                            }
                                            className="outline-none  -mr-3 pl-3 py-1 bg-custom-grayFA   w-full "
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                    <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[250px] pl-3 py-1">
                                        Cost (Sq.m)
                                    </span>
                                    <input
                                        onChange={
                                            handleNewAdditionalPremiumOnChange
                                        }
                                        name="premiumCost"
                                        value={
                                            newAdditionalPremium.premiumCost ||
                                            ""
                                        }
                                        type="number"
                                        className="w-full px-4 focus:outline-none"
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <button
                                        className="w-[60px] h-[31px] rounded-[7px] gradient-btn2 p-[4px]  text-custom-solidgreen hover:shadow-custom4"
                                        onClick={handleAddNewPremium}
                                    >
                                        <div className="flex justify-center items-center  bg-white montserrat-bold h-full w-full rounded-[4px] p-[4px] text-sm">
                                            ADD
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center items-center ">
                                <p className="montserrat-regular text-center text-red-500">
                                    No units have been uploaded.
                                    <span className="underline ml-2 text-blue-500">
                                        {" "}
                                        Upload
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center w-full mb-4">
                            <div className="flex justify-center w-[662px]">
                                <table>
                                    <thead>
                                        <tr className="h-[49px] bg-custombg3 text-custom-gray81 montserrat-semibold text-sm">
                                            <th className="rounded-tl-[10px] pl-[10px] w-[300px] text-left">
                                                Additional Premium
                                            </th>
                                            <th className="w-[150px] text-left">
                                                Premium Cost
                                            </th>
                                            <th className="rounded-tr-[10px] w-[150px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pricingData &&
                                            pricingData.additionalPremiums
                                                .length > 0 &&
                                            pricingData.additionalPremiums.map(
                                                (item, index) => {
                                                    // console.log("item",item)
                                                    return (
                                                        <tr
                                                            className="h-[46px] even:bg-custombg3 text-sm "
                                                            key={index}
                                                        >
                                                            <td className="text-custom-gray81 pl-3">
                                                                {item?.viewName}
                                                            </td>
                                                            <td>
                                                                <div className=" ">
                                                                    <input
                                                                        type="number"
                                                                        name="premiumCost"
                                                                        id="premiumCost"
                                                                        value={
                                                                            item.premiumCost
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleInputOnChange(
                                                                                index,
                                                                                e
                                                                            )
                                                                        }
                                                                        className="bg-white h-[29px] w-[120px] border border-[#D9D9D9] rounded-[5px] px-2 outline-none text-center"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <FaRegTrashAlt
                                                                    className="size-5 text-custom-gray81 hover:text-red-500"
                                                                    onClick={() =>
                                                                        handleRemovePremium(
                                                                            index
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {(excelId ? true : localExcelId) && (
                                <button
                                    onClick={handleOpenModal}
                                    className="w-[137px] h-[37px] rounded-[7px] gradient-btn2 p-[4px] text-custom-solidgreen hover:shadow-custom4 text-sm"
                                >
                                    <div className="flex justify-center items-center bg-white montserrat-semibold h-full w-full rounded-[4px] p-[4px] text-sm">
                                        Assign to units
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <AdditionalPremiumAssignModal
                        propertyData={propertyData}
                        modalRef={modalRef}
                    />
                </div>
            </div>
        </>
    );
};

export default AdditionalPremiums;
