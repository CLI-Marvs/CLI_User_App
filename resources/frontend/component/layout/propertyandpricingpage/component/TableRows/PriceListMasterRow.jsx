import React from "react";
import moment from "moment";
import { toLowerCaseText } from "@/util/formatToLowerCase";

const PriceListMasterRow = ({
    item,
    handlePriceListItemClick,
    handleStatusClick,
    toggled,
    setToggled,
}) => {
    console.log("item", item);
    return (
        <tr
            onClick={(event) => {
                if (item?.status === "Draft") {
                    event.stopPropagation();
                    return;
                }
                handlePriceListItemClick(item);
            }}
            key={item.price_list_master_id}
            className={`flex gap-4 mt-2 h-[144px] shadow-custom5 rounded-[10px] overflow-hidden px-4 ${
                item?.status === "Draft"
                    ? "bg-white cursor-not-allowed"
                    : item?.status === "Approved"
                    ? "bg-[#F0F3EE]"
                    : "bg-[#EBF0F6]"
            }  ${
                item?.status === "On-going Approval" ||
                item?.status === "Approved not Live" ||
                item?.status === "Approved and Live"
                    ? "cursor-pointer"
                    : ""
            } text-custom-bluegreen text-sm `}
        >
            <td className="w-[100px] flex flex-col items-start justify-center gap-2">
                <div>
                    <p
                        className={`font-bold ${
                            item?.status === "Draft"
                                ? "text-custom-gray81"
                                : item?.status === "Approved"
                                ? "text-custom-solidgreen"
                                : "text-[#5B9BD5]"
                        }`}
                    >
                        {item?.status}
                    </p>
                    <span>
                        {/* Fix the formatting */}
                        {moment(item.created_at).format("M / D / YYYY")}
                    </span>
                </div>
                <div>
                    {item?.status !== "Approved not Live" &&
                        item?.status !== "Approved and Live" && (
                            <p
                                className="underline text-blue-500 cursor-pointer"
                                onClick={(event) =>
                                    handleStatusClick(
                                        event,
                                        item,
                                        item?.status === "On-going Approval"
                                            ? "Cancel"
                                            : "Edit"
                                    )
                                }
                            >
                                {item?.status === "On-going Approval"
                                    ? "Cancel"
                                    : "Edit"}{" "}
                                {/* - {item?.price_list_master_id} */}
                            </p>
                        )}
                </div>
                {item?.status === "Approved" && (
                    <div className="flex gap-2 items-center">
                        <div>
                            <p
                                className={`${
                                    toggled
                                        ? "text-[#FF0000]"
                                        : "text-custom-gray81"
                                } font-semibold`}
                            >
                                Live
                            </p>
                        </div>
                        <div className="mt-1">
                            <button
                                className={`toggle-btn ${
                                    toggled ? "toggled" : ""
                                }`}
                                onClick={() => setToggled(!toggled)}
                            >
                                <div className="thumb"></div>
                            </button>
                        </div>
                    </div>
                )}
            </td>
            <td className="w-[150px] flex items-center justify-start">
                <div>
                    <p>{toLowerCaseText(item?.property_name)}</p>
                    <p>Tower {item?.tower_phases[0]?.tower_phase_name}</p>
                </div>
            </td>
            <td className="w-[200px] flex items-center justify-start">
                <div>
                    <p className="space-x-1">
                        <span>Base Price (Sq.M.)</span>
                        <span>{item?.pricebasic_details?.base_price}</span>
                    </p>
                    <p className="space-x-1">
                        <span>Reservation</span>
                        <span>{item?.pricebasic_details?.reservation_fee}</span>
                    </p>
                    <p className="space-x-1">
                        <span>Transfer Charge</span>
                        <span>{item?.pricebasic_details?.transfer_charge}</span>
                        <span>
                            {item?.pricebasic_details?.transfer_charge
                                ? "%"
                                : ""}
                        </span>
                    </p>
                    <p className="space-x-1">
                        <span>VAT</span>
                        <span>{item?.pricebasic_details?.vat}</span>
                        <span>{item?.pricebasic_details?.vat ? "%" : ""}</span>
                    </p>
                    <p className="space-x-1">
                        <span>VATable Threshold</span>
                        <span>
                            {item?.pricebasic_details?.vatable_less_price}
                        </span>
                    </p>
                    <p className="space-x-1">
                        <span>Effective Balcony Base</span>
                        <span>
                            {item?.pricebasic_details?.effective_balcony_base}
                        </span>
                        <span>
                            {item?.pricebasic_details?.effective_balcony_base
                                ? "%"
                                : ""}
                        </span>
                    </p>
                </div>
            </td>

            {/* Render the price version */}
            <td className="w-[150px] flex items-center justify-start">
                <div>
                    <p>
                        {item?.price_versions?.map((version, versionIndex) => {
                            return (
                                <span key={versionIndex}>
                                    {version?.version_name} -{" "}
                                    {version?.percent_increase}
                                    {version?.percent_increase ? "%" : ""}
                                    {versionIndex <
                                    item?.price_versions?.length - 1 ? (
                                        <br />
                                    ) : (
                                        ""
                                    )}
                                </span>
                            );
                        })}
                    </p>
                </div>
            </td>

            {/* Render the sold per price version */}
            <td className="w-[150px] flex items-center justify-start">
                <div>
                    <p className="space-x-1">
                        <span>Version 1 - 0</span>
                    </p>
                    <p className="space-x-1">
                        <span>Version 1 - 0</span>
                    </p>
                </div>
            </td>

            {/* Render the promos*/}
            <td className="w-[100px] flex items-center justify-start">
                <div>
                    <p className="space-x-1">
                        <span>Version 1 - 0</span>
                    </p>
                </div>
            </td>

            {/* Render payment schemes */}
            <td className="w-[150px] flex items-center justify-start rounded-r-lg text-sm">
                <div className="flex ">
                    <ul className=" pl-4 list-none ">
                        {item?.price_versions?.map((version, versionIndex) => {
                            return (
                                <li key={versionIndex} className="">
                                    {version?.payment_schemes?.map(
                                        (scheme, schemeIndex) => {
                                            return (
                                                <ul
                                                    key={schemeIndex}
                                                    className="pl-4"
                                                >
                                                    <li>
                                                        {
                                                            scheme?.payment_scheme_name
                                                        }
                                                    </li>
                                                </ul>
                                            );
                                        }
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </td>
        </tr>
    );
};

export default PriceListMasterRow;
