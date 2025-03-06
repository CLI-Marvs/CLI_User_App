import React, { useEffect } from "react";

const ExpandableDataTable = ({
    expandUnitTableViewRef,
    computedUnitPrices,
    staticHeaders,
    hasVersionHeaders,
    hasPricingHeaders,
    subHeaders,
    headers,
}) => {
    useEffect(() => {}, [computedUnitPrices]);

    //Evend handler
    const handleCloseExpandableDataTable = () => {
        if (expandUnitTableViewRef.current) {
            expandUnitTableViewRef.current.close();
        }
    };
    return (
        <dialog
            className="modal min-w-[400px] max-w-[90vw] rounded-lg  overflow-auto"
            ref={expandUnitTableViewRef}
        >
            <div className="px-14 rounded-[10px] h-full">
                <div
                    method="dialog"
                    className="pt-2 flex justify-end -mr-[50px] backdrop:bg-black/100"
                >
                    <button
                        className="flex justify-center w-10 h-10 items-center rounded-full  text-custom-bluegreen hover:bg-custombg"
                        onClick={handleCloseExpandableDataTable}
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="py-2 px-4 overflow-x-auto   max-h-[80vh] w-full">
                <div className=" ">
                    <table className="w-full montserrat-regular">
                        <thead>
                            {/* First Row: Main Headers */}
                            <tr>
                                <th
                                    colSpan={staticHeaders.length}
                                    className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border"
                                >
                                    Unit
                                </th>
                                {/* Only show Version column if there are version headers */}
                                {hasVersionHeaders && (
                                    <th
                                        colSpan={
                                            subHeaders.versionHeaders.length
                                        }
                                        className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border px-2"
                                    >
                                        Version
                                    </th>
                                )}
                                {hasPricingHeaders && (
                                    <th
                                        colSpan={
                                            subHeaders.pricingHeaders.length
                                        }
                                        className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border px-2"
                                    >
                                        Pricing
                                    </th>
                                )}
                                <th
                                    colSpan={
                                        subHeaders.paymentSchemeHeaders &&
                                        subHeaders.paymentSchemeHeaders.length
                                    }
                                    className="bg-[#31498a] w-full py-3 montserrat-semibold text-white border-black border px-2"
                                >
                                    Payment Scheme
                                </th>
                               
                            </tr>

                            {/* Second Row: Column Titles */}
                            <tr className="bg-[#aebee3] border-black border">
                                {headers.map((title, headerIndex) => (
                                    <th
                                        key={headerIndex}
                                        className={`${
                                            title === "Type"
                                                ? "px-9"
                                                : title === "List price w/ VAT"
                                                ? "px-10"
                                                : "px-4"
                                        } py-4 border-black border montserrat-medium`}
                                    >
                                        {title}
                                    </th>
                                ))}
                                {/* {pricingData?.priceVersions.map(
                                                    (priceVersionItem) => (
                                                        <th
                                                            key={
                                                                priceVersionItem.id
                                                            }
                                                            className="bg-[#aebee3] w-full py-3 montserrat-regular text-black border-black border px-2 font-normal"
                                                        > 
                                                            <div className="flex gap-2 justify-center">
                                                                {priceVersionItem.payment_scheme.map(
                                                                    (
                                                                        paymentSchemeItem
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                paymentSchemeItem.id
                                                                            }
                                                                        >
                                                                            {
                                                                                paymentSchemeItem.payment_scheme_name
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>

                                                            
                                                        </th>
                                                    )
                                                )} */}
                            </tr>

                            {/* Third Row: Only render if there are version headers */}
                            {hasVersionHeaders && (
                                <tr className="bg-[#aebee3] border-black border montserrat-regular">
                                    <th colSpan={staticHeaders.length}></th>

                                    {/* Percent Increase Row */}
                                    {subHeaders.percentIncreaseHeaders.map(
                                        (percent, index) => (
                                            <th
                                                key={index}
                                                className="font-normal"
                                            >
                                                {percent}%
                                            </th>
                                        )
                                    )}

                                    {/* Pricing Fields - only render if there are pricing headers */}
                                    {hasPricingHeaders &&
                                        subHeaders.pricingHeaders.map(
                                            (priceKey, index) => (
                                                <th
                                                    key={index}
                                                    className="montserrat-regular text-sm text-center pl-4"
                                                ></th>
                                            )
                                        )}
                                </tr>
                            )}
                        </thead>

                        <tbody className="bg-white">
                            {computedUnitPrices &&
                                computedUnitPrices.map((unit, unitIndex) => {
                                    const priceData = computedUnitPrices.find(
                                        (p) => p.unit === unit.unit
                                    );

                                    return (
                                        <tr key={unitIndex}>
                                            {/* Map  Unit Data */}
                                            <td className="px-2 border-black border">
                                                {unit.floor}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.room_number}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.unit}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.type}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.indoor_area}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.balcony_area}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.garden_area}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {unit.total_area}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {priceData?.computed_list_price_with_vat &&
                                                    priceData?.computed_list_price_with_vat.toLocaleString()}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {priceData?.computed_transfer_charge &&
                                                    priceData?.computed_transfer_charge.toLocaleString()}
                                            </td>
                                            <td className="px-2 border-black border">
                                                {priceData?.computed_reservation_fee &&
                                                    priceData?.computed_reservation_fee.toLocaleString()}
                                            </td>{" "}
                                            <td className="px-2 border-black border">
                                                {priceData?.computed_total_contract_price &&
                                                    priceData?.computed_total_contract_price.toLocaleString()}
                                            </td>
                                            {/* Map Dynamic Price Versions */}
                                            {/* {priceVersions.map(
                                                            (
                                                                version,
                                                                versionIndex
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        versionIndex
                                                                    }
                                                                    className="px-2 border-black border text-center"
                                                                >
                                                                    {version.no_of_allowed_buyers ||
                                                                        "-"}
                                                                </td>
                                                            )
                                                        )} */}
                                            {/* {pricingData &&
                                                            Object.keys(
                                                                pricingData?.priceListSettings
                                                            ).length > 0 &&
                                                            pricingData
                                                                ?.priceListSettings
                                                                ?.base_price !==
                                                                0 &&
                                                            Object.keys(
                                                                pricingData?.priceListSettings
                                                            )
                                                                .filter((key) =>
                                                                    [
                                                                        "transfer_charge",
                                                                        "reservation_fee",
                                                                        "vatable_less_price",
                                                                    ].includes(
                                                                        key
                                                                    )
                                                                )
                                                                .map(
                                                                    (
                                                                        priceListItem
                                                                    ) => {
                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    priceListItem
                                                                                }  
                                                                                className="px-2 border-black border text-center"
                                                                            >
                                                                                {
                                                                                    pricingData
                                                                                        .priceListSettings[
                                                                                        priceListItem
                                                                                    ]
                                                                                }{" "}
                                                                                
                                                                            </td>
                                                                        );
                                                                    }
                                                                )} */}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </dialog>
    );
};

export default ExpandableDataTable;
