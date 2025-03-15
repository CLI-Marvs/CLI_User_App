import React, { useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import AdditionalPremiumAssignModal from "../modals/AdditionalPremiumAssignModal";
import { usePricing } from "@/component/layout/propertyandpricingpage/basicpricing/context/BasicPricingContext";
import { useUnit } from "@/context/PropertyPricing/UnitContext";
import { showToast } from "@/util/toastUtil";
import UnitUploadButton from "@/component/layout/propertyandpricingpage/basicpricing/component/UnitUploadButton";
import CustomInput from "@/component/Input/CustomInput";

const AdditionalPremiums = ({ priceListData, isOpen, toggleAccordion }) => {
    //States
    const { excelId, excelIdFromPriceList } = useUnit();
    const [newAdditionalPremium, setNewAdditionalPremium] = useState({
        viewName: "",
        premiumCost: 0,
        excludedUnitIds: [],
    });
    const modalRef = useRef(null);
    const { setPricingData, pricingData } = usePricing();

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
        // Function to generate random Id
        const generateBigIntId = () => {
            return (
                BigInt(Date.now()) * BigInt(1000) +
                BigInt(Math.floor(Math.random() * 1000))
            ).toString();
        };
        const generatedId = generateBigIntId();
        setPricingData((prevState) => ({
            ...prevState,
            additionalPremiums: [
                ...prevState.additionalPremiums,
                {
                    id: parseInt(generatedId),
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
    const onChangeNewAdditionalPremium = (e) => {
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
                        {(excelIdFromPriceList !== null &&
                            excelIdFromPriceList !== undefined) ||
                        (excelId !== null && excelId !== undefined) ? (
                            priceListData &&
                            priceListData.data.status === "Draft" ? (
                                <div className="flex justify-center w-full h-[31px] gap-3 mb-4">
                                    <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[375px] text-sm">
                                        <span className="text-custom-gray81 bg-custombg3 flex items-center w-[100%] font-semibold -mr-3 pl-3 py-1">
                                            Additional Premium
                                        </span>
                                        <div className="relative w-full">
                                            <CustomInput
                                                type="text"
                                                name="viewName"
                                                value={
                                                    newAdditionalPremium.viewName ||
                                                    ""
                                                }
                                                className="outline-none  -mr-3 pl-3 py-1 bg-custom-grayFA   w-full "
                                                onChange={
                                                    onChangeNewAdditionalPremium
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center border border-custom-grayF1 rounded-[5px] overflow-hidden w-[204px] text-sm">
                                        <span className="text-custom-gray81 bg-custombg3 font-semibold flex w-[250px] pl-3 py-1">
                                            Cost (Sq.m)
                                        </span>
                                        <CustomInput
                                            type="number"
                                            name="premiumCost"
                                            value={
                                                newAdditionalPremium.premiumCost ||
                                                ""
                                            }
                                            className="outline-none  -mr-3 pl-3 py-1 bg-custom-grayFA   w-full "
                                            onChange={
                                                onChangeNewAdditionalPremium
                                            }
                                            restrictNumbers={true}
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
                            ) : null
                        ) : (
                            <div className="w-auto">
                                <UnitUploadButton
                                    buttonType="link"
                                    priceListData={priceListData}
                                />
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
                                        pricingData.additionalPremiums?.length >
                                            0 ? (
                                            pricingData.additionalPremiums.map(
                                                (item, index) => {
                                                    return (
                                                        <tr
                                                            className="h-[46px] even:bg-custombg3 text-sm"
                                                            key={index}
                                                        >
                                                            <td className="text-custom-gray81 pl-3">
                                                                {item?.viewName}
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <CustomInput
                                                                        type="number"
                                                                        id={`premiumCost-${index}`}
                                                                        name="premiumCost"
                                                                        value={
                                                                            item.premiumCost ||
                                                                            ""
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
                                                                        restrictNumbers={
                                                                            true
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                            {priceListData &&
                                                            priceListData.data
                                                                .status ===
                                                                "Draft" ? (
                                                                <td>
                                                                    <FaRegTrashAlt
                                                                        className="size-5 text-custom-gray81 hover:text-red-500 cursor-pointer"
                                                                        onClick={() =>
                                                                            handleRemovePremium(
                                                                                index
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            ) : null}
                                                        </tr>
                                                    );
                                                }
                                            )
                                        ) : (
                                            <tr key="no-premiums">
                                                <td
                                                    colSpan="5"
                                                    className="text-center text-custom-gray81 py-2 montserrat-semibold"
                                                >
                                                    No additional premiums
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {(excelId ? true : excelIdFromPriceList) &&
                                (priceListData &&
                                priceListData.data.status === "Draft" ? (
                                    <button
                                        onClick={handleOpenModal}
                                        className="w-[137px] h-[37px] rounded-[7px] gradient-btn2 p-[4px] text-custom-solidgreen hover:shadow-custom4 text-sm"
                                    >
                                        <div className="flex justify-center items-center bg-white montserrat-semibold h-full w-full rounded-[4px] p-[4px] text-sm">
                                            Assign to units
                                        </div>
                                    </button>
                                ) : null)}
                        </div>
                    </div>
                </div>
                <div>
                    <AdditionalPremiumAssignModal
                        priceListData={priceListData}
                        modalRef={modalRef}
                    />
                </div>
            </div>
        </>
    );
};

export default AdditionalPremiums;
